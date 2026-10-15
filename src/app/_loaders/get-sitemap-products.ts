import { collectAllPages } from "@/graphql/paginate";
import { runQuery } from "@/lib/run-query";
import { getSitemapProductsQueryOptions } from "../_helpers/query";

export interface SitemapProduct {
  id: number;
  date: string | null;
}

export interface SitemapProducts {
  products: SitemapProduct[];
  /** Set when a later page failed: `products` is then only what was collected before it. */
  error: Error | null;
}

// 10 pages × 100 = 1000 vehicles.
const MAX_PAGES = 10;

/**
 * Every published product with its last-modified date, for the sitemap. A failure
 * after the first page returns what was collected plus the `error`; a failure on
 * the first page throws.
 */
export async function getSitemapProducts(): Promise<SitemapProducts> {
  const { nodes, error } = await collectAllPages(async (after) => {
    const data = await runQuery(getSitemapProductsQueryOptions(after));
    return {
      nodes: (data.products?.edges ?? []).map((edge) => edge.node),
      hasNextPage: data.products?.pageInfo?.hasNextPage,
      endCursor: data.products?.pageInfo?.endCursor,
    };
  }, MAX_PAGES);

  return {
    products: nodes.map((node) => ({ id: node.databaseId, date: node.date ?? null })),
    error,
  };
}
