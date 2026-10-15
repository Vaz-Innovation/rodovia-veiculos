import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSitemapProducts } from "./get-sitemap-products";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("@/graphql/execute", () => ({ execute }));

const connection = (
  nodes: Array<{ databaseId: number; date?: string | null }>,
  endCursor: string | null,
  hasNextPage: boolean,
) => ({
  products: { pageInfo: { hasNextPage, endCursor }, edges: nodes.map((node) => ({ node })) },
});

describe("getSitemapProducts", () => {
  beforeEach(() => {
    execute.mockReset();
  });

  it("collects id and date across pages", async () => {
    execute
      .mockResolvedValueOnce(connection([{ databaseId: 1, date: "2026-01-01" }], "c1", true))
      .mockResolvedValueOnce(connection([{ databaseId: 2 }], null, false));

    await expect(getSitemapProducts()).resolves.toEqual({
      products: [
        { id: 1, date: "2026-01-01" },
        { id: 2, date: null },
      ],
      error: null,
    });
  });

  it("stops at the safety cap of 10 pages", async () => {
    // Real cursors differ per page; identical ones would be served from the query cache.
    let n = 0;
    execute.mockImplementation(async () => connection([{ databaseId: 1 }], `cursor-${++n}`, true));

    await getSitemapProducts();

    expect(execute).toHaveBeenCalledTimes(10);
  });

  it("returns the products collected before a later page failed, with the error", async () => {
    const error = new Error("page 2 down");
    execute
      .mockResolvedValueOnce(connection([{ databaseId: 1 }], "c1", true))
      .mockRejectedValueOnce(error);

    await expect(getSitemapProducts()).resolves.toEqual({
      products: [{ id: 1, date: null }],
      error,
    });
  });

  it("throws when the first page fails", async () => {
    execute.mockRejectedValue(new Error("down"));

    await expect(getSitemapProducts()).rejects.toThrow("down");
  });
});
