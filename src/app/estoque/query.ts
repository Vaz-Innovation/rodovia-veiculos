import { graphql } from "@/graphql/__gen__";

export const CarsListPaginatedQuery = graphql(`
  query ProductsPaginated($first: Int!, $after: String) {
    products(first: $first, after: $after) {
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
          productsfields {
            model
            version
            yearmodel
            mileage
            transmission
            fuel
            color
            featured
            features {
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
