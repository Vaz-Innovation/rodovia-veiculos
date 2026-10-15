import { cacheLife, cacheTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GraphQLResponseError } from "@/lib/graphql/error";
import { CategoryPreview_Query } from "../_helpers/query";
import { getCategoryPreviewImage } from "./get-category-preview-image";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("@/graphql/execute", () => ({ execute }));

describe("getCategoryPreviewImage", () => {
  beforeEach(() => {
    execute.mockReset();
    vi.mocked(cacheLife).mockClear();
    vi.mocked(cacheTag).mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns the cover of the first vehicle in the category, cached for the inventory lifetime", async () => {
    execute.mockResolvedValue({
      products: { edges: [{ node: { image: { sourceUrl: "https://wp.test/a.jpg" } } }] },
    });

    await expect(getCategoryPreviewImage("suv")).resolves.toBe("https://wp.test/a.jpg");
    expect(execute).toHaveBeenCalledWith(CategoryPreview_Query, { category: "suv" });
    expect(cacheTag).toHaveBeenCalledWith("vehicle", "category:suv");
    expect(cacheLife).toHaveBeenCalledWith("inventory");
  });

  it("returns null for an empty category", async () => {
    execute.mockResolvedValue({ products: { edges: [] } });

    await expect(getCategoryPreviewImage("suv")).resolves.toBeNull();
    expect(cacheLife).toHaveBeenCalledWith("inventory");
  });

  it("returns null for a backend 404 without treating it as a failure", async () => {
    execute.mockRejectedValue(
      new GraphQLResponseError([{ message: "nope", extensions: { code: "NOT_FOUND" } }]),
    );

    await expect(getCategoryPreviewImage("suv")).resolves.toBeNull();
    expect(cacheLife).toHaveBeenCalledWith("inventory");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("degrades to null on a real failure, cached only briefly", async () => {
    execute.mockRejectedValue(new Error("down"));

    await expect(getCategoryPreviewImage("suv")).resolves.toBeNull();
    expect(cacheLife).toHaveBeenCalledWith("minutes");
    expect(cacheLife).not.toHaveBeenCalledWith("inventory");
    expect(console.error).toHaveBeenCalled();
  });
});
