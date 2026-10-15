import { describe, expect, it, vi } from "vitest";

import { collectAllPages, type PageResult } from "./paginate";

const page = (
  nodes: number[],
  endCursor: string | null,
  hasNextPage: boolean,
): PageResult<number> => ({ nodes, endCursor, hasNextPage });

describe("collectAllPages", () => {
  it("follows the cursor until there is no next page", async () => {
    const fetchPage = vi
      .fn<(after: string | null) => Promise<PageResult<number>>>()
      .mockResolvedValueOnce(page([1, 2], "c1", true))
      .mockResolvedValueOnce(page([3], "c2", true))
      .mockResolvedValueOnce(page([4], null, false));

    expect(await collectAllPages(fetchPage, 10)).toEqual({ nodes: [1, 2, 3, 4], error: null });
    expect(fetchPage.mock.calls.map(([after]) => after)).toEqual([null, "c1", "c2"]);
  });

  it("stops when the server claims a next page but sends no cursor", async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([1], null, true));

    expect(await collectAllPages(fetchPage, 10)).toEqual({ nodes: [1], error: null });
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("never exceeds maxPages", async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([1], "next", true));

    expect(await collectAllPages(fetchPage, 3)).toEqual({ nodes: [1, 1, 1], error: null });
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });

  it("keeps what was collected when a later page fails, and reports the error", async () => {
    const error = new Error("page 3 failed");
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page([1, 2], "c1", true))
      .mockResolvedValueOnce(page([3], "c2", true))
      .mockRejectedValueOnce(error);

    await expect(collectAllPages(fetchPage, 10)).resolves.toEqual({ nodes: [1, 2, 3], error });
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });

  it("throws when the very first page fails (nothing to return)", async () => {
    const error = new Error("first page failed");
    const fetchPage = vi.fn().mockRejectedValue(error);

    await expect(collectAllPages(fetchPage, 10)).rejects.toBe(error);
  });
});
