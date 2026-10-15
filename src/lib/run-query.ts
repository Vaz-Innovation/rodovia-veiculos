import {
  type QueryFunction,
  type QueryFunctionContext,
  type QueryKey,
  skipToken,
} from "@tanstack/react-query";

/**
 * Runs query options (from `gqlQueryOptions`) on the server without a QueryClient.
 *
 * On the server a QueryClient is created per call, so it caches nothing — the
 * Next.js Data Cache does, driven by the options' `init.next`. And React Query
 * reads `Date.now()` when it stores a result, which Cache Components forbids while
 * prerendering. Calling the options' own `queryFn` keeps one source of truth for
 * the request (document, variables, cache policy) and keeps the route static.
 *
 * Use `getQueryClient().fetchQuery` instead when the client cache is the point
 * (dehydrating for `<HydrationBoundary>`), at request time.
 */
export async function runQuery<TData, TKey extends QueryKey>(options: {
  queryKey: TKey;
  queryFn?: QueryFunction<TData, TKey, never> | typeof skipToken;
}): Promise<TData> {
  const { queryKey, queryFn } = options;
  if (!queryFn || queryFn === skipToken) {
    throw new Error(`runQuery: the options for ${JSON.stringify(queryKey[0])} have no queryFn`);
  }

  return queryFn({
    queryKey,
    signal: new AbortController().signal,
    meta: undefined,
  } as unknown as QueryFunctionContext<TKey, never>);
}
