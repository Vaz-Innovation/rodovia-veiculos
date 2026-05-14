import { graphql } from "@/graphql/__gen__";
import { gqlInfiniteOptions, gqlQueryOptions } from "@/graphql/gqlpc";
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

const CarsListPaginated_Query = graphql(`
  query ProductsPaginated(
    $first: Int!
    $after: String
    $where: RootQueryToProductConnectionWhereArgs
  ) {
    products(first: $first, after: $after, where: $where) {
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

const PAGE_SIZE = 24;

const VehicleFilterOptions_Query = graphql(`
  query VehicleFilterOptions {
    productBrands(first: 100) {
      nodes {
        name
        slug
      }
    }
    productCategories(first: 100) {
      nodes {
        name
        slug
      }
    }
    productTags(first: 100) {
      nodes {
        name
        slug
      }
    }
  }
`);

export function getVehicleFilterOptionsQueryOptions() {
  return gqlQueryOptions(VehicleFilterOptions_Query, {
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export const carsListSearchParams = {
  search: parseAsString.withDefault(""),
  productBrand: parseAsString.withDefault(""),
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

export function getCarsListInfiniteQueryOptions(
  params: inferParserType<typeof carsListSearchParams>,
) {
  const slug = (v: string) => v.toLowerCase();

  const multiAttributes: MultiAttributeFilterInput[] = [];
  if (params.model) multiAttributes.push({ taxonomy: "PA_MODEL", terms: [slug(params.model)] });
  if (params.transmission)
    multiAttributes.push({ taxonomy: "PA_TRANSMISSION", terms: [slug(params.transmission)] });
  if (params.fuel) multiAttributes.push({ taxonomy: "PA_FUEL", terms: [slug(params.fuel)] });
  if (params.color) multiAttributes.push({ taxonomy: "PA_COLOR", terms: [slug(params.color)] });
  if (params.condition)
    multiAttributes.push({ taxonomy: "PA_CONDITION", terms: [slug(params.condition)] });

  const where: RootQueryToProductConnectionWhereArgs = {
    ...(params.search && { search: params.search }),
    ...(params.productBrand && { productBrand: params.productBrand }),
    ...(params.category && { category: params.category }),
    ...(params.minPrice != null && { minPrice: params.minPrice }),
    ...(params.maxPrice != null && { maxPrice: params.maxPrice }),
    ...(params.tagIn.length && { tagIn: params.tagIn }),
    ...(multiAttributes.length && {
      multiAttributes,
      multiAttributeRelation: AttributeGroupRelationEnum.And,
    }),
    orderby: buildOrderBy(params.sort),
  };

  return gqlInfiniteOptions(CarsListPaginated_Query, {
    input: (after) => ({ first: PAGE_SIZE, after: after ?? undefined, where }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const pageInfo = lastPage?.products?.pageInfo;
      return pageInfo?.hasNextPage && pageInfo.endCursor ? pageInfo.endCursor : null;
    },
  });
}

function buildOrderBy(sort: string) {
  switch (sort) {
    case "price_asc":
      return [{ field: ProductsOrderByEnum.Price, order: OrderEnum.Asc }];
    case "price_desc":
      return [{ field: ProductsOrderByEnum.Price, order: OrderEnum.Desc }];
    default:
      return [{ field: ProductsOrderByEnum.Date, order: OrderEnum.Desc }];
  }
}

export const CarsListQuery = CarsListPaginated_Query;
