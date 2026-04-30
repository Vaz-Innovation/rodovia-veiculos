import { graphql } from "../__gen__";

export const CarsListQuery = graphql(`
  query Products {
    products {
      edges {
        node {
          title
        }
      }
    }
  }
`);
