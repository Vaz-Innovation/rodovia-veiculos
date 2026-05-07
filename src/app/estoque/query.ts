import { graphql } from "@/graphql/__gen__";

export const CarsListQuery = graphql(`
  query Products {
    products {
      edges {
        node {
          id
          title
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
