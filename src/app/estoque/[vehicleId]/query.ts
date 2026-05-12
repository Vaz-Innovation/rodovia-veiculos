import { graphql } from "@/graphql/__gen__";

export const CarByIdQuery = graphql(`
  query CarById($id: ID!) {
    product(id: $id, idType: DATABASE_ID) {
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
`);
