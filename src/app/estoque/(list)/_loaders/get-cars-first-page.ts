import { dehydrate } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/query-client";
import { type CarsListParams, getCarsListInfiniteQueryOptions } from "../_helpers/query";

/**
 * The first page of the listing for the current filters, as a dehydrated query
 * state ready for `<HydrationBoundary>`. The request itself is cached by the
 * query's `init` policy (tags per active filter); this needs a real QueryClient,
 * and React Query reads `Date.now()`, so call it at request time (after
 * `connection()`), never while prerendering. Failures throw.
 */
export async function getCarsFirstPage(params: CarsListParams) {
  const queryClient = getQueryClient();
  await queryClient.fetchInfiniteQuery(getCarsListInfiniteQueryOptions(params));
  return dehydrate(queryClient);
}
