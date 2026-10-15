import { beforeEach, describe, expect, it, vi } from "vitest";

import { carsListSearchParams } from "../_helpers/query";
import { getCarsFirstPage } from "./get-cars-first-page";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("@/graphql/execute", () => ({ execute }));

const params = (overrides: Partial<Record<keyof typeof carsListSearchParams, unknown>> = {}) =>
  ({
    search: "",
    brand: "",
    model: "",
    minPrice: null,
    maxPrice: null,
    yearMin: null,
    yearMax: null,
    kmMax: null,
    transmission: "",
    fuel: "",
    condition: "",
    color: "",
    tagIn: [],
    category: "",
    sort: "recent",
    ...overrides,
  }) as Parameters<typeof getCarsFirstPage>[0];

const firstPage = {
  products: { found: 0, pageInfo: { hasNextPage: false, endCursor: null }, edges: [] },
};

describe("getCarsFirstPage", () => {
  beforeEach(() => {
    execute.mockReset();
    execute.mockResolvedValue(firstPage);
  });

  it("returns the first page as a dehydrated state for <HydrationBoundary>", async () => {
    const state = await getCarsFirstPage(params());

    expect(state.queries).toHaveLength(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute.mock.calls[0][1]).toMatchObject({ first: 24, where: { status: "publish" } });
  });

  it("scopes the cache key to the filters (different filters never share an entry)", async () => {
    const all = await getCarsFirstPage(params());
    const fiat = await getCarsFirstPage(params({ brand: "Fiat" }));

    expect(all.queries[0].queryHash).not.toBe(fiat.queries[0].queryHash);
  });

  it("propagates failures instead of dehydrating an empty state", async () => {
    execute.mockRejectedValue(new Error("down"));

    await expect(getCarsFirstPage(params())).rejects.toThrow("down");
  });
});
