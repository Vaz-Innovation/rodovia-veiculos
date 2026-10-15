import { cacheLife, cacheTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VehicleFilterOptions_Query } from "../_helpers/query";
import { getFilterOptions } from "./get-filter-options";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("@/graphql/execute", () => ({ execute }));

describe("getFilterOptions", () => {
  beforeEach(() => {
    execute.mockReset();
    vi.mocked(cacheLife).mockClear();
    vi.mocked(cacheTag).mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns the options, tagged for broad and targeted purges", async () => {
    const options = { brands: [{ name: "Fiat", slug: "fiat" }] };
    execute.mockResolvedValue(options);

    await expect(getFilterOptions()).resolves.toEqual(options);
    expect(execute).toHaveBeenCalledWith(VehicleFilterOptions_Query);
    expect(cacheTag).toHaveBeenCalledWith("vehicle", "filter-options");
    expect(cacheLife).toHaveBeenCalledWith("inventory");
  });

  it("degrades to empty options on failure, cached only briefly", async () => {
    execute.mockRejectedValue(new Error("down"));

    await expect(getFilterOptions()).resolves.toEqual({});
    expect(cacheLife).toHaveBeenCalledWith("minutes");
    expect(cacheLife).not.toHaveBeenCalledWith("inventory");
    expect(console.error).toHaveBeenCalled();
  });
});
