import type { ProcedureUtils } from "@orpc/tanstack-query";
import type {
  DefaultError,
  FetchQueryOptions,
  QueryKey,
  queryOptions as tanstackQueryOptions,
  infiniteQueryOptions as tanstackInfiniteQueryOptions,
} from "@tanstack/react-query";
import { cache } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import "server-only";

import { createQueryClient } from "./query-client";

/**
 * This is part of the Optimize SSR setup.
 *
 * @see {@link https://orpc.unnoq.com/docs/adapters/next#optimize-ssr}
 */
// globalThis.$client = createORPCClient(link) as ContractRouterClient<typeof apiContract>;

const getQueryClient = cache(createQueryClient);

export function prefetch<
  T extends
    | ReturnType<ProcedureUtils<any, any, any, any>["queryOptions"]>
    | ReturnType<ProcedureUtils<any, any, any, any>["infiniteOptions"]>
    | ReturnType<typeof tanstackQueryOptions<any, any, any, any>>
    | ReturnType<typeof tanstackInfiniteQueryOptions<any, any, any, any>>,
>(queryOptions: T, infinite?: boolean) {
  const queryClient = getQueryClient();
  if (infinite) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions as any);
  }
}

export function fetchQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
>(options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>) {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(options);
}
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>;
}
