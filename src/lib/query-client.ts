import {
  defaultShouldDehydrateQuery,
  environmentManager,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

import generatedIntrospection from "@/graphql/__gen__/possible-types.json";
import { GraphMutationCache } from "@/lib/graphql/cache/graph-mutation-cache";
import { GraphQueryCache } from "@/lib/graphql/cache/graph-query-cache";
import { GraphQLResponseError } from "@/lib/graphql/error";
import { type GraphCache, InMemoryGraphCache } from "@/lib/graphql/helpers";

const STALE_AFTER_MS = 5_000;
const BROWSER_RETRIES = 3;

const makeGraphCache = (): GraphCache =>
  new InMemoryGraphCache({
    possibleTypes: generatedIntrospection.possibleTypes,
  });

let browserGraphCache: GraphCache | undefined;

/** The normalized cache behind the query client: fresh per call on the server, a singleton in the browser. */
export function getGraphCache(): GraphCache {
  if (environmentManager.isServer()) {
    return makeGraphCache();
  }
  browserGraphCache ??= makeGraphCache();
  return browserGraphCache;
}

/** GraphQL errors are answers, not glitches: only transport failures in the browser are retried. */
const shouldRetry = (failureCount: number, error: Error): boolean =>
  !environmentManager.isServer() &&
  !GraphQLResponseError.is(error) &&
  failureCount < BROWSER_RETRIES;

export const makeQueryClient = () => {
  const graphCache = getGraphCache();

  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_AFTER_MS, retry: shouldRetry },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
        // Don't redact errors: Next.js detects dynamic pages by their thrown errors.
        shouldRedactErrors: () => false,
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
    queryCache: new GraphQueryCache(graphCache),
    mutationCache: new GraphMutationCache(graphCache),
  });
};

let browserQueryClient: QueryClient | undefined;

/**
 * Server: a new client per call, so requests never share state — hold on to the
 * one you get for the duration of a loader. Browser: a singleton.
 */
export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
