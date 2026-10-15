import { beforeEach, describe, expect, it, vi } from "vitest";

const { getFilterOptions } = vi.hoisted(() => ({ getFilterOptions: vi.fn() }));
vi.mock("./_loaders/get-filter-options", () => ({ getFilterOptions }));
vi.mock("./filters-client", () => ({ FiltersClient: () => null }));

import FiltersSlot from "./page";

describe("FiltersSlot", () => {
  beforeEach(() => {
    getFilterOptions.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("passes the loaded options to the client", async () => {
    const options = { brands: [{ name: "Fiat", slug: "fiat" }] };
    getFilterOptions.mockResolvedValue(options);

    const element = await FiltersSlot();

    expect(element.props.data).toBe(options);
  });

  it("degrades to empty options (and logs) when loading fails", async () => {
    getFilterOptions.mockRejectedValue(new Error("down"));

    const element = await FiltersSlot();

    expect(element.props.data).toEqual({});
    expect(console.error).toHaveBeenCalled();
  });
});
