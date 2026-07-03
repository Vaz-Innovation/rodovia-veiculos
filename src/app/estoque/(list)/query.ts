import { graphql } from "@/graphql/__gen__";
import { gqlInfiniteOptions } from "@/graphql/gqlpc";
import {
  AttributeGroupRelationEnum,
  ProductsOrderByEnum,
  OrderEnum,
  type MultiAttributeFilterInput,
  type RootQueryToProductConnectionWhereArgs,
} from "@/graphql/__gen__/graphql";
import { SORT_OPTIONS } from "@/hooks/useVehicleFilters";
import { parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";
import type { inferParserType } from "nuqs/server";

export const CarsListPaginated_Query = graphql(`
  query ProductsPaginated(
    $first: Int!
    $after: String
    $where: RootQueryToProductConnectionWhereArgs
  ) {
    products(first: $first, after: $after, where: $where) {
      found
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...Estoque_ProductsFragment
        }
      }
    }
  }
`);

export const PAGE_SIZE = 24;

export const carsListSearchParams = {
  search: parseAsString.withDefault(""),
  brand: parseAsString.withDefault(""),
  model: parseAsString.withDefault(""),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  yearMin: parseAsInteger,
  yearMax: parseAsInteger,
  kmMax: parseAsInteger,
  transmission: parseAsString.withDefault(""),
  fuel: parseAsString.withDefault(""),
  condition: parseAsString.withDefault(""),
  color: parseAsString.withDefault(""),
  tagIn: parseAsArrayOf(parseAsString).withDefault([]),
  category: parseAsString.withDefault(""),
  sort: parseAsStringLiteral(SORT_OPTIONS).withDefault("recent"),
};

export type CarsListParams = inferParserType<typeof carsListSearchParams>;

/** Builds the GraphQL `where` args from the parsed search params. Deterministic so
 * the server prefetch and the client infinite query resolve to the same query key. */
export function buildProductsWhere(params: CarsListParams): RootQueryToProductConnectionWhereArgs {
  const slug = (v: string) => v.toLowerCase();

  const multiAttributes: MultiAttributeFilterInput[] = [];
  if (params.brand)
    multiAttributes.push({ taxonomy: "PA_ATTRIBUTE_BRAND", terms: [slug(params.brand)] });
  if (params.model) multiAttributes.push({ taxonomy: "PA_MODEL", terms: [slug(params.model)] });
  if (params.transmission)
    multiAttributes.push({ taxonomy: "PA_TRANSMISSION", terms: [slug(params.transmission)] });
  if (params.fuel) multiAttributes.push({ taxonomy: "PA_FUEL", terms: [slug(params.fuel)] });
  if (params.color) multiAttributes.push({ taxonomy: "PA_COLOR", terms: [slug(params.color)] });
  if (params.condition)
    multiAttributes.push({ taxonomy: "PA_CONDITION", terms: [slug(params.condition)] });

  const numericAttributeRanges: { taxonomy: string; min?: number; max?: number }[] = [];
  if (params.yearMin != null || params.yearMax != null) {
    numericAttributeRanges.push({
      taxonomy: "pa_yearmodel",
      ...(params.yearMin != null && { min: params.yearMin }),
      ...(params.yearMax != null && { max: params.yearMax }),
    });
  }
  if (params.kmMax != null) {
    numericAttributeRanges.push({ taxonomy: "pa_mileage", max: params.kmMax });
  }

  return {
    status: "publish",
    ...(params.search && { search: params.search }),
    ...(params.category && { category: params.category }),
    ...(params.minPrice != null && { minPrice: params.minPrice }),
    ...(params.maxPrice != null && { maxPrice: params.maxPrice }),
    ...(params.tagIn.length && {
      tagIdAnd: params.tagIn.map(Number).filter((n) => Number.isFinite(n)),
    }),
    ...(multiAttributes.length && {
      multiAttributes,
      multiAttributeRelation: AttributeGroupRelationEnum.And,
    }),
    ...(numericAttributeRanges.length && { numericAttributeRanges }),
    ...buildSortWhere(params.sort),
  };
}

export function getCarsListInfiniteQueryOptions(params: CarsListParams) {
  const where = buildProductsWhere(params);

  return gqlInfiniteOptions(CarsListPaginated_Query, {
    input: (after) => ({ first: PAGE_SIZE, after: after ?? undefined, where }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const pageInfo = lastPage?.products?.pageInfo;
      return pageInfo?.hasNextPage && pageInfo.endCursor ? pageInfo.endCursor : null;
    },
  });
}

function buildSortWhere(sort: string): Partial<RootQueryToProductConnectionWhereArgs> {
  switch (sort) {
    case "price_asc":
      return { orderby: [{ field: ProductsOrderByEnum.Price, order: OrderEnum.Asc }] };
    case "price_desc":
      return { orderby: [{ field: ProductsOrderByEnum.Price, order: OrderEnum.Desc }] };
    case "year_desc":
      return { orderByAttribute: { taxonomy: "pa_yearmodel", order: OrderEnum.Desc } };
    case "km_asc":
      return { orderByAttribute: { taxonomy: "pa_mileage", order: OrderEnum.Asc } };
    default:
      return { orderby: [{ field: ProductsOrderByEnum.Date, order: OrderEnum.Desc }] };
  }
}

/**
 * Cache tags for the `use cache` wrapper around the ProductsPaginated fetch.
 * Empty values are dropped because `cacheTag` rejects empty strings; the constant
 * `vehicle` tag lets every products cache entry be revalidated in one call, while
 * the per-filter tags allow narrower `revalidateTag(brandSlug)` invalidations.
 */
export function productCacheTags(params: CarsListParams): string[] {
  return [
    "vehicle",
    params.search,
    params.brand,
    params.model,
    params.category,
    params.tagIn.slice().sort().join(","),
  ].filter((tag) => tag.length > 0);
}

/** Number of active filters (search text excluded), used for the "Limpar" badges. */
export function countActiveFilters(params: CarsListParams): number {
  return (
    (params.brand ? 1 : 0) +
    (params.model ? 1 : 0) +
    (params.minPrice || params.maxPrice ? 1 : 0) +
    (params.yearMin || params.yearMax ? 1 : 0) +
    (params.kmMax ? 1 : 0) +
    (params.transmission ? 1 : 0) +
    (params.fuel ? 1 : 0) +
    (params.color ? 1 : 0) +
    (params.condition ? 1 : 0) +
    params.tagIn.length +
    (params.category ? 1 : 0)
  );
}

/** nuqs patch that resets every listing filter back to its default. */
export const CLEARED_FILTERS = {
  search: null,
  brand: null,
  model: null,
  minPrice: null,
  maxPrice: null,
  yearMin: null,
  yearMax: null,
  kmMax: null,
  transmission: null,
  fuel: null,
  condition: null,
  color: null,
  tagIn: null,
  category: null,
  sort: null,
} as const;
