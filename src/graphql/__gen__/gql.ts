/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment VehicleDetail_ProductsFragment on Product {\n    id\n    databaseId\n    name\n    date\n    shortDescription\n    featured\n    productTags {\n      nodes {\n        name\n      }\n    }\n    ... on SimpleProduct {\n      onSale\n      stockStatus\n      price\n      rawPrice: price(format: RAW)\n      regularPrice\n      salePrice\n      stockStatus\n      stockQuantity\n      soldIndividually\n      attributes {\n        nodes {\n          name\n          options\n        }\n      }\n    }\n    image {\n      sourceUrl\n    }\n    galleryImages {\n      nodes {\n        sourceUrl\n      }\n    }\n  }\n": typeof types.VehicleDetail_ProductsFragmentFragmentDoc,
    "\n  query CarById($id: ID!) {\n    product(id: $id, idType: DATABASE_ID) {\n      ...VehicleDetail_ProductsFragment\n    }\n  }\n": typeof types.CarByIdDocument,
    "\n  query VehicleMetadata($id: ID!) {\n    product(id: $id, idType: DATABASE_ID) {\n      name\n      shortDescription\n      image {\n        sourceUrl\n      }\n      ... on SimpleProduct {\n        price\n        attributes {\n          nodes {\n            name\n            options\n          }\n        }\n      }\n    }\n  }\n": typeof types.VehicleMetadataDocument,
    "\n  fragment Estoque_ProductsFragment on Product {\n    id\n    databaseId\n    name\n    date\n    featured\n    productCategories {\n      edges {\n        node {\n          name\n        }\n      }\n    }\n    productTags {\n      nodes {\n        name\n      }\n    }\n    ... on SimpleProduct {\n      onSale\n      stockStatus\n      price\n      rawPrice: price(format: RAW)\n      regularPrice\n      salePrice\n      stockStatus\n      stockQuantity\n      soldIndividually\n      attributes {\n        nodes {\n          name\n          options\n        }\n      }\n    }\n    image {\n      sourceUrl\n    }\n  }\n": typeof types.Estoque_ProductsFragmentFragmentDoc,
    "\n  query ProductsPaginated(\n    $first: Int!\n    $after: String\n    $where: RootQueryToProductConnectionWhereArgs\n  ) {\n    products(first: $first, after: $after, where: $where) {\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      edges {\n        cursor\n        node {\n          ...Estoque_ProductsFragment\n        }\n      }\n    }\n  }\n": typeof types.ProductsPaginatedDocument,
    "\n  query VehicleFilterOptions {\n    productCategories(first: 100) {\n      nodes {\n        name\n        slug\n      }\n    }\n    productTags(first: 100) {\n      nodes {\n        databaseId\n        name\n        slug\n      }\n    }\n    brands: productAttributeTerms(taxonomy: \"pa_brand\") {\n      name\n      slug\n    }\n    models: productAttributeTerms(taxonomy: \"pa_model\") {\n      name\n      slug\n    }\n    transmissions: productAttributeTerms(taxonomy: \"pa_transmission\") {\n      name\n      slug\n    }\n    fuels: productAttributeTerms(taxonomy: \"pa_fuel\") {\n      name\n      slug\n    }\n    colors: productAttributeTerms(taxonomy: \"pa_color\") {\n      name\n      slug\n    }\n    conditions: productAttributeTerms(taxonomy: \"pa_condition\") {\n      name\n      slug\n    }\n  }\n": typeof types.VehicleFilterOptionsDocument,
};
const documents: Documents = {
    "\n  fragment VehicleDetail_ProductsFragment on Product {\n    id\n    databaseId\n    name\n    date\n    shortDescription\n    featured\n    productTags {\n      nodes {\n        name\n      }\n    }\n    ... on SimpleProduct {\n      onSale\n      stockStatus\n      price\n      rawPrice: price(format: RAW)\n      regularPrice\n      salePrice\n      stockStatus\n      stockQuantity\n      soldIndividually\n      attributes {\n        nodes {\n          name\n          options\n        }\n      }\n    }\n    image {\n      sourceUrl\n    }\n    galleryImages {\n      nodes {\n        sourceUrl\n      }\n    }\n  }\n": types.VehicleDetail_ProductsFragmentFragmentDoc,
    "\n  query CarById($id: ID!) {\n    product(id: $id, idType: DATABASE_ID) {\n      ...VehicleDetail_ProductsFragment\n    }\n  }\n": types.CarByIdDocument,
    "\n  query VehicleMetadata($id: ID!) {\n    product(id: $id, idType: DATABASE_ID) {\n      name\n      shortDescription\n      image {\n        sourceUrl\n      }\n      ... on SimpleProduct {\n        price\n        attributes {\n          nodes {\n            name\n            options\n          }\n        }\n      }\n    }\n  }\n": types.VehicleMetadataDocument,
    "\n  fragment Estoque_ProductsFragment on Product {\n    id\n    databaseId\n    name\n    date\n    featured\n    productCategories {\n      edges {\n        node {\n          name\n        }\n      }\n    }\n    productTags {\n      nodes {\n        name\n      }\n    }\n    ... on SimpleProduct {\n      onSale\n      stockStatus\n      price\n      rawPrice: price(format: RAW)\n      regularPrice\n      salePrice\n      stockStatus\n      stockQuantity\n      soldIndividually\n      attributes {\n        nodes {\n          name\n          options\n        }\n      }\n    }\n    image {\n      sourceUrl\n    }\n  }\n": types.Estoque_ProductsFragmentFragmentDoc,
    "\n  query ProductsPaginated(\n    $first: Int!\n    $after: String\n    $where: RootQueryToProductConnectionWhereArgs\n  ) {\n    products(first: $first, after: $after, where: $where) {\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      edges {\n        cursor\n        node {\n          ...Estoque_ProductsFragment\n        }\n      }\n    }\n  }\n": types.ProductsPaginatedDocument,
    "\n  query VehicleFilterOptions {\n    productCategories(first: 100) {\n      nodes {\n        name\n        slug\n      }\n    }\n    productTags(first: 100) {\n      nodes {\n        databaseId\n        name\n        slug\n      }\n    }\n    brands: productAttributeTerms(taxonomy: \"pa_brand\") {\n      name\n      slug\n    }\n    models: productAttributeTerms(taxonomy: \"pa_model\") {\n      name\n      slug\n    }\n    transmissions: productAttributeTerms(taxonomy: \"pa_transmission\") {\n      name\n      slug\n    }\n    fuels: productAttributeTerms(taxonomy: \"pa_fuel\") {\n      name\n      slug\n    }\n    colors: productAttributeTerms(taxonomy: \"pa_color\") {\n      name\n      slug\n    }\n    conditions: productAttributeTerms(taxonomy: \"pa_condition\") {\n      name\n      slug\n    }\n  }\n": types.VehicleFilterOptionsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment VehicleDetail_ProductsFragment on Product {\n    id\n    databaseId\n    name\n    date\n    shortDescription\n    featured\n    productTags {\n      nodes {\n        name\n      }\n    }\n    ... on SimpleProduct {\n      onSale\n      stockStatus\n      price\n      rawPrice: price(format: RAW)\n      regularPrice\n      salePrice\n      stockStatus\n      stockQuantity\n      soldIndividually\n      attributes {\n        nodes {\n          name\n          options\n        }\n      }\n    }\n    image {\n      sourceUrl\n    }\n    galleryImages {\n      nodes {\n        sourceUrl\n      }\n    }\n  }\n"): typeof import('./graphql').VehicleDetail_ProductsFragmentFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CarById($id: ID!) {\n    product(id: $id, idType: DATABASE_ID) {\n      ...VehicleDetail_ProductsFragment\n    }\n  }\n"): typeof import('./graphql').CarByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VehicleMetadata($id: ID!) {\n    product(id: $id, idType: DATABASE_ID) {\n      name\n      shortDescription\n      image {\n        sourceUrl\n      }\n      ... on SimpleProduct {\n        price\n        attributes {\n          nodes {\n            name\n            options\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').VehicleMetadataDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment Estoque_ProductsFragment on Product {\n    id\n    databaseId\n    name\n    date\n    featured\n    productCategories {\n      edges {\n        node {\n          name\n        }\n      }\n    }\n    productTags {\n      nodes {\n        name\n      }\n    }\n    ... on SimpleProduct {\n      onSale\n      stockStatus\n      price\n      rawPrice: price(format: RAW)\n      regularPrice\n      salePrice\n      stockStatus\n      stockQuantity\n      soldIndividually\n      attributes {\n        nodes {\n          name\n          options\n        }\n      }\n    }\n    image {\n      sourceUrl\n    }\n  }\n"): typeof import('./graphql').Estoque_ProductsFragmentFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProductsPaginated(\n    $first: Int!\n    $after: String\n    $where: RootQueryToProductConnectionWhereArgs\n  ) {\n    products(first: $first, after: $after, where: $where) {\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      edges {\n        cursor\n        node {\n          ...Estoque_ProductsFragment\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').ProductsPaginatedDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VehicleFilterOptions {\n    productCategories(first: 100) {\n      nodes {\n        name\n        slug\n      }\n    }\n    productTags(first: 100) {\n      nodes {\n        databaseId\n        name\n        slug\n      }\n    }\n    brands: productAttributeTerms(taxonomy: \"pa_brand\") {\n      name\n      slug\n    }\n    models: productAttributeTerms(taxonomy: \"pa_model\") {\n      name\n      slug\n    }\n    transmissions: productAttributeTerms(taxonomy: \"pa_transmission\") {\n      name\n      slug\n    }\n    fuels: productAttributeTerms(taxonomy: \"pa_fuel\") {\n      name\n      slug\n    }\n    colors: productAttributeTerms(taxonomy: \"pa_color\") {\n      name\n      slug\n    }\n    conditions: productAttributeTerms(taxonomy: \"pa_condition\") {\n      name\n      slug\n    }\n  }\n"): typeof import('./graphql').VehicleFilterOptionsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
