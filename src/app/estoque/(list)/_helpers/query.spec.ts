import { describe, expect, it } from "vitest";

import { type CarsListParams, getCarsListInfiniteQueryOptions } from "./query";

const params = (overrides: Partial<CarsListParams> = {}): CarsListParams =>
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
  }) as CarsListParams;

describe("getCarsListInfiniteQueryOptions", () => {
  it("scopes the query key to the filters", () => {
    const all = getCarsListInfiniteQueryOptions(params());
    const fiat = getCarsListInfiniteQueryOptions(params({ brand: "Fiat" }));

    expect(all.queryKey).not.toEqual(fiat.queryKey);
  });

  it("does not leak the cache policy into the query options", () => {
    expect(getCarsListInfiniteQueryOptions(params())).not.toHaveProperty("init");
  });
});
