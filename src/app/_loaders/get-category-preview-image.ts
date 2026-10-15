import { cacheLife, cacheTag } from "next/cache";

import { nullIfNotFound } from "@/lib/error-status";
import { getQueryClient } from "@/lib/query-client";
import { tryCatch } from "@/lib/try-catch";
import { getCategoryPreviewQueryOptions } from "../_helpers/query";

/**
 * Cover image of the first published vehicle in a category, or `null` when the
 * category is empty, missing (404) or WordPress failed. The preview is
 * decorative, so a failure is handled here — inside the cache scope, where the
 * error is intact — by returning `null` for a short while instead of caching the
 * absence for the full lifetime or failing the page.
 */
export async function getCategoryPreviewImage(slug: string): Promise<string | null> {
  "use cache";
  cacheTag("vehicle", `category:${slug}`);

  const [data, error] = await tryCatch(
    nullIfNotFound(getQueryClient().fetchQuery(getCategoryPreviewQueryOptions(slug))),
  );
  if (error) {
    console.error(`[home] category preview "${slug}" failed`, error);
    cacheLife("minutes");
    return null;
  }

  cacheLife("inventory");
  return data?.products?.edges?.[0]?.node?.image?.sourceUrl ?? null;
}
