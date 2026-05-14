import { graphql } from "@/graphql/__gen__";
import { gqlQueryOptions } from "@/graphql/gqlpc";

export const CarById_Query = graphql(`
  query CarById($id: ID!) {
    product(id: $id, idType: DATABASE_ID) {
      ...VehicleDetail_ProductsFragment
    }
  }
`);

export function getCarByIdQueryOptions(id: string) {
  return gqlQueryOptions(CarById_Query, { input: { id } });
}
