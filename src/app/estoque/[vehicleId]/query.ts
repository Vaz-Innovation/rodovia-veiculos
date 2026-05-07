import { graphql } from "@/graphql/__gen__";

export const CarByIdQuery = graphql(`
  query CarById($id: ID!) {
    product(id: $id) {
      id
      title
      date
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
    }
  }
`);
