import { graphql } from "@/graphql/__gen__";
import { inventoryCache } from "@/graphql/cache-policy";
import { gqlQueryOptions } from "@/graphql/gqlpc";

export const CarById_Query = graphql(`
  query CarById($id: ID!) {
    product(id: $id, idType: DATABASE_ID) {
      ...VehicleDetail_ProductsFragment
      ...VehicleMetadata_ProductFragment
    }
  }
`);

export const VehicleMetadata_ProductFragment = graphql(`
  fragment VehicleMetadata_ProductFragment on Product {
    name
    shortDescription
    image {
      sourceUrl
    }
    ... on SimpleProduct {
      price
      attributes {
        nodes {
          name
          options
        }
      }
    }
  }
`);

export const AllVehicleIds_Query = graphql(`
  query AllVehicleIds($first: Int!, $after: String) {
    products(first: $first, after: $after, where: { status: "publish" }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          databaseId
        }
      }
    }
  }
`);

export const getVehicleQueryOptions = (id: string) =>
  gqlQueryOptions(CarById_Query, { input: { id }, init: inventoryCache(`vehicle:${id}`) });

export const getAllVehicleIdsQueryOptions = (after: string | null) =>
  gqlQueryOptions(AllVehicleIds_Query, {
    input: { first: 100, after },
    init: inventoryCache(),
  });
