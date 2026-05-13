import type { ClientRetryPluginContext } from "@orpc/client/plugins";
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

// const link = new OpenAPILink<ORPCClientContext>(apiContract, {
//   url: env.BASE_URL,
//   async headers() {
//     const head = await headers();
//     const org = await getFullOrganization();
//     const augumentedHeaders = new Headers(head);
//     augumentedHeaders.set("x-client", "Web Client");
//     if (org) {
//       augumentedHeaders.set("x-tenant", org.slug);
//     }
//     return augumentedHeaders;
//   },
//   plugins: orpcPlugins,
//   interceptors: [
//     onError((error) => {
//       // Map oRPC BAD_REQUEST validation errors to 422 UNPROCESSABLE_CONTENT with Zod flattened data
//       if (error instanceof ValidationError) {
//         const zodError = new z.ZodError(error.issues as z.core.$ZodIssue[]);
//         const message = z.prettifyError(zodError);
//         const data = z.flattenError(zodError);
//         throw new ORPCError("UNPROCESSABLE_CONTENT", {
//           status: 422,
//           message,
//           data,
//           cause: error.cause,
//         });
//       }
//       logger.error(
//         {
//           error,
//         },
//         `Error in oRPC request in the server: ${(error as Error).message}`,
//       );
//     }),
//   ],
// });
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
