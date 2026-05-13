import { graphql } from "@/graphql/__gen__";
import { gqlQueryOptions } from "@/graphql/gqlpc";

export const CarById_Query = graphql(`
  query CarById($id: ID!) {
    product(id: $id, idType: DATABASE_ID) {
      id
      databaseId
      name
      date
      shortDescription
      featured
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
      galleryImages {
        nodes {
          sourceUrl
        }
      }
    }
  }
`);

export function getCarByIdQueryOptions(id: string) {
  return gqlQueryOptions(CarById_Query, { input: { id } });
}
