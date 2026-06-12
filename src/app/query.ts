import { graphql } from "@/graphql/__gen__";
import { execute } from "@/graphql/execute";

export const CategoryPreview_Query = graphql(`
  query CategoryPreview($category: String!) {
    products(first: 1, where: { category: $category }) {
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

export async function fetchCategoryPreviewImage(slug: string): Promise<string | null> {
  try {
    const data = await execute(CategoryPreview_Query, { category: slug });
    return data.products?.edges?.[0]?.node?.image?.sourceUrl ?? null;
  } catch {
    return null;
  }
}
