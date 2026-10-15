import { GqlRpc } from "@/lib/graphql/gql-rpc";
import type { GraphSubscriber } from "@/lib/graphql/types";
import { getGraphCache } from "@/lib/query-client";
import { type ExecuteInit, execute } from "./execute";

type AppGqlRpc = GqlRpc<typeof execute, GraphSubscriber, ExecuteInit>;

const gqlrpc: AppGqlRpc = new GqlRpc(execute, getGraphCache());

/**
 * `queryOptions` for a codegen document; pass them to `queryClient.fetchQuery` or
 * `useQuery`. `init` (e.g. `inventoryCache(...)`) sets the server cache policy.
 */
export const gqlQueryOptions: AppGqlRpc["gqlQueryOptions"] = gqlrpc.gqlQueryOptions.bind(gqlrpc);

/** Note: the key omits the variables (see `GqlRpc`); add them back when they scope the data. */
export const gqlInfiniteOptions: AppGqlRpc["gqlInfiniteOptions"] =
  gqlrpc.gqlInfiniteOptions.bind(gqlrpc);

export const gqlMutationOptions: AppGqlRpc["gqlMutationOptions"] =
  gqlrpc.gqlMutationOptions.bind(gqlrpc);
