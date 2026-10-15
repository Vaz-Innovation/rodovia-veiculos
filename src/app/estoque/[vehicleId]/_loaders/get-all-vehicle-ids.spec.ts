import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAllVehicleIds } from "./get-all-vehicle-ids";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("@/graphql/execute", () => ({ execute }));

const connection = (ids: Array<number | null>, endCursor: string | null, hasNextPage: boolean) => ({
  products: {
    pageInfo: { hasNextPage, endCursor },
    edges: ids.map((databaseId) => ({ node: { databaseId } })),
  },
});

describe("getAllVehicleIds", () => {
  beforeEach(() => {
    execute.mockReset();
  });

  it("collects the ids of every page as strings", async () => {
    execute
      .mockResolvedValueOnce(connection([1, 2], "c1", true))
      .mockResolvedValueOnce(connection([3], null, false));

    await expect(getAllVehicleIds()).resolves.toEqual({ ids: ["1", "2", "3"], error: null });
    expect(execute.mock.calls[1][1]).toEqual({ first: 100, after: "c1" });
  });

  it("skips nodes without a database id", async () => {
    execute.mockResolvedValue(connection([1, null], null, false));

    await expect(getAllVehicleIds()).resolves.toEqual({ ids: ["1"], error: null });
  });

  it("handles a missing connection", async () => {
    execute.mockResolvedValue({ products: null });

    await expect(getAllVehicleIds()).resolves.toEqual({ ids: [], error: null });
  });

  it("returns the ids collected before a later page failed, with the error", async () => {
    const error = new Error("page 2 down");
    execute.mockResolvedValueOnce(connection([1, 2], "c1", true)).mockRejectedValueOnce(error);

    await expect(getAllVehicleIds()).resolves.toEqual({ ids: ["1", "2"], error });
  });

  it("throws when the first page fails", async () => {
    execute.mockRejectedValue(new Error("down"));

    await expect(getAllVehicleIds()).rejects.toThrow("down");
  });
});
