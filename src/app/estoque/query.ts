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
            edges {
              node {
                name
              }
            }
          }
          productBrands {
            edges {
              node {
                name
              }
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

          galleryImages {
            nodes {
              sourceUrl
            }
          }
        }
      }
    }
  }
`);

// Keep the old query for backwards compatibility if needed
export const CarsListQuery = CarsListPaginatedQuery;
