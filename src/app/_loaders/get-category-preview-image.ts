import { nullIfNotFound } from "@/lib/error-status";
import { runQuery } from "@/lib/run-query";
import { getCategoryPreviewQueryOptions } from "../_helpers/query";

/**
 * Cover image of the first published vehicle in a category, or `null` when the
 * category is empty or missing (404). Cached by the query's `init` policy; other
 * failures throw.
 */
export async function getCategoryPreviewImage(slug: string): Promise<string | null> {
  const data = await nullIfNotFound(runQuery(getCategoryPreviewQueryOptions(slug)));
  return data?.products?.edges?.[0]?.node?.image?.sourceUrl ?? null;
}
