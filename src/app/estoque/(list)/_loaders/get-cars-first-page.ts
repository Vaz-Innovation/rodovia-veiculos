import { type DehydratedState, dehydrate } from "@tanstack/react-query";
import { cacheLife, cacheTag } from "next/cache";

import { getQueryClient } from "@/lib/query-client";
import { tryCatch } from "@/lib/try-catch";
import {
  type CarsListParams,
  getCarsListInfiniteQueryOptions,
  productCacheTags,
} from "../_helpers/query";

/**
 * The first page of the listing for the current filters, as a dehydrated query
 * state ready for `<HydrationBoundary>`, or `null` when WordPress failed (the
 * client then fetches the list itself). Fetching and dehydrating both happen
 * inside the `use cache` scope, where React Query's `Date.now()` reads are
 * allowed, so the page needs no request-time rendering.
 *
 * `use cache` keys the result on `params`, and `cacheTag` attaches the constant
 * `vehicle` tag plus the active filter values, so entries can be revalidated
 * broadly (`revalidateTag("vehicle")`) or per filter (`revalidateTag(brandSlug)`).
 * A failure is handled here and cached only briefly.
 */
export async function getCarsFirstPage(params: CarsListParams): Promise<DehydratedState | null> {
  "use cache";
  cacheTag(...productCacheTags(params));

  const queryClient = getQueryClient();
  const [, error] = await tryCatch(
    queryClient.fetchInfiniteQuery(getCarsListInfiniteQueryOptions(params)),
  );
  if (error) {
    console.error("[estoque] failed to load the first page", error);
    cacheLife("minutes");
    return null;
  }

  cacheLife("inventory");
  return dehydrate(queryClient);
}
