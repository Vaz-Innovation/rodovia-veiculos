import { graphql } from "@/graphql/__gen__";
import { gqlQueryOptions } from "@/graphql/gqlpc";

export const CategoryPreview_Query = graphql(`
  query CategoryPreview($category: String!) {
    products(first: 1, where: { category: $category, status: "publish" }) {
      edges {
        node {
          image {
            sourceUrl
          }
        }
      }
    }
  }
`);

export const SitemapProducts_Query = graphql(`
  query SitemapProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          databaseId
          date
        }
      }
    }
  }
`);

export const getCategoryPreviewQueryOptions = (category: string) =>
  gqlQueryOptions(CategoryPreview_Query, { input: { category } });

export const getSitemapProductsQueryOptions = (after: string | null) =>
  gqlQueryOptions(SitemapProducts_Query, { input: { first: 100, after } });
