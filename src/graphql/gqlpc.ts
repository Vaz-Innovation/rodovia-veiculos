import { GqlRpc } from "@/lib/graphql/gql-rpc";
import { getGraphCache } from "@/lib/query-client";
import { execute } from "./execute";

const gqlrpc = new GqlRpc(execute, getGraphCache());

/** `queryOptions` for a codegen document; pass them to `queryClient.fetchQuery` or `useQuery`. */
export const gqlQueryOptions: GqlRpc<typeof execute>["gqlQueryOptions"] =
  gqlrpc.gqlQueryOptions.bind(gqlrpc);

/** Note: the key omits the variables (see `GqlRpc`); add them back when they scope the data. */
export const gqlInfiniteOptions: GqlRpc<typeof execute>["gqlInfiniteOptions"] =
  gqlrpc.gqlInfiniteOptions.bind(gqlrpc);

export const gqlMutationOptions: GqlRpc<typeof execute>["gqlMutationOptions"] =
  gqlrpc.gqlMutationOptions.bind(gqlrpc);
