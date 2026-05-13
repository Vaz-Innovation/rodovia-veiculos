import { graphql } from "@/graphql/__gen__";

export const CarsListPaginatedQuery = graphql(`
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
          id
          databaseId
          name
          date
          productCategories {
            edges {
              node {
                name
              }
            }
          }
          productTags {
            nodes {
              name
            }
          }
          ... on SimpleProduct {
            onSale
            stockStatus
            price
            rawPrice: price(format: RAW)
            regularPrice
            salePrice
            stockStatus
            stockQuantity
            soldIndividually
            attributes {
              nodes {
                name
                options
              }
            }
          }
          image {
            sourceUrl
          }
        }
      }
    }
  }
`);

export const CarsListQuery = CarsListPaginatedQuery;
