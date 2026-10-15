import { beforeEach, describe, expect, it, vi } from "vitest";

import { GraphQLResponseError } from "@/lib/graphql/error";
import { CategoryPreview_Query } from "../_helpers/query";
import { getCategoryPreviewImage } from "./get-category-preview-image";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("@/graphql/execute", () => ({ execute }));

describe("getCategoryPreviewImage", () => {
  beforeEach(() => {
    execute.mockReset();
  });

  it("returns the cover of the first vehicle in the category", async () => {
    execute.mockResolvedValue({
      products: { edges: [{ node: { image: { sourceUrl: "https://wp.test/a.jpg" } } }] },
    });

    await expect(getCategoryPreviewImage("suv")).resolves.toBe("https://wp.test/a.jpg");
    expect(execute).toHaveBeenCalledWith(
      CategoryPreview_Query,
      { category: "suv" },
      { next: { tags: ["vehicle", "category:suv"], revalidate: 900 } },
    );
  });

  it("returns null for an empty category", async () => {
    execute.mockResolvedValue({ products: { edges: [] } });

    await expect(getCategoryPreviewImage("suv")).resolves.toBeNull();
  });

  it("returns null when the backend answers 404", async () => {
    execute.mockRejectedValue(
      new GraphQLResponseError([{ message: "nope", extensions: { code: "NOT_FOUND" } }]),
    );

    await expect(getCategoryPreviewImage("suv")).resolves.toBeNull();
  });

  it("propagates errors so a transient failure is not cached as 'no image'", async () => {
    execute.mockRejectedValue(new Error("down"));

    await expect(getCategoryPreviewImage("suv")).rejects.toThrow("down");
  });
});
