import type {
  InfiniteData,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

import {
  infiniteQueryOptions as buildInfiniteQueryOptions,
  mutationOptions as buildMutationOptions,
  queryOptions as buildQueryOptions,
} from "@tanstack/react-query";

import type { TypedDocumentString } from "./__gen__/graphql";
import { execute } from "./execute";

/**
 * Normalizes the GraphQL query string to create a stable, flattened cache key.
 * It collapses multi-line queries into a single line and removes extra whitespace.
 */
const normalizeQueryKey = (query: string): string => {
  return String(query).replace(/\s+/g, " ").trim();
};

/**
 * Type for query options input with params property
 */
type QueryOptionsInput<TResult, TVariables> = (TVariables extends Record<string, never>
  ? {
      input?: never;
    }
  : {
      input: TVariables;
    }) &
  Omit<UseQueryOptions<TResult, Error, TResult>, "queryKey" | "queryFn">;

/**
 * Generates type-safe UseQueryOptions using your custom execute function.
 * @param query - The TypedDocumentString from codegen
 * @param options - Object containing input (variables) and React Query options
 */
export function gqlQueryOptions<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  options?: QueryOptionsInput<TResult, TVariables>,
) {
  // Extract input and other query options
  type OptionsType = { input?: TVariables } & Record<string, unknown>;
  const { input: params, ...queryOptions } = (options ?? {}) as OptionsType;

  // Normalize the query for the key
  const queryKeyString = normalizeQueryKey(query.toString());

  // Construct the Query Key: ["graph", NormalizedString, Variables]
  // This allows GraphQueryCache to intercept and use Apollo Cache
  const queryKey = ["graph", queryKeyString, params ?? {}] as const;

  type ExecuteFn = (
    q: TypedDocumentString<TResult, TVariables>,
    v?: TVariables,
  ) => Promise<TResult>;

  return buildQueryOptions<TResult, Error, TResult>({
    queryKey,
    queryFn: async () => {
      // Invoke the execute function
      const exec = execute as ExecuteFn;
      if (params !== undefined) {
        return exec(query, params);
      }
      return exec(query);
    },
    ...queryOptions,
  });
}
type InfiniteQueryOptionsInput<
  TVariables,
  TQueryFnData,
  TError = Error,
  TData = InfiniteData<TQueryFnData, unknown>,
  TQueryKey extends QueryKey = readonly unknown[],
  TPageParam = unknown,
> = {
  input: (pageParam: TPageParam) => TVariables;
} & Omit<
  Parameters<
    typeof buildInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>
  >[0],
  "queryKey" | "queryFn"
>;

/**
 * Generates type-safe UseInfiniteQueryOptions using your custom execute function.
 * Similar to orPC's infiniteOptions pattern.
 * @param query - The TypedDocumentString from codegen
 * @param options - Object containing input function (pageParam => variables) and React Query infinite options
 */
export function gqlInfiniteOptions<
  TVariables,
  TQueryFnData,
  TError = Error,
  TData = InfiniteData<TQueryFnData, unknown>,
  TQueryKey extends QueryKey = readonly unknown[],
  TPageParam = unknown,
>(
  query: TypedDocumentString<TQueryFnData, TVariables>,
  options: InfiniteQueryOptionsInput<
    TVariables,
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
) {
  // Extract input function and other query options
  const { input: inputFn, ...infiniteOptions } = options;

  // Normalize the query for the key
  const queryKeyString = normalizeQueryKey(query.toString());

  // Include the initial-page variables in the key so different filter states
  // get different cache entries (page-cursor variables are excluded since those
  // change per page, but the "static" variables like `where` are captured here).
  const initialVars = inputFn(options.initialPageParam as TPageParam);
  const queryKey = ["graph", queryKeyString, initialVars] as const;
  type ExecuteFn = (
    q: TypedDocumentString<TQueryFnData, TVariables>,
    v: TVariables,
  ) => Promise<TQueryFnData>;
  return buildInfiniteQueryOptions({
    queryKey: queryKey as unknown as TQueryKey,
    queryFn: async ({ pageParam }) => {
      // Generate variables using the input function with the current page param
      const variables = inputFn(pageParam as TPageParam);
      const exec = execute as ExecuteFn;
      const data = (await exec(query, variables)) as TQueryFnData;
      return data;
    },
    ...infiniteOptions,
  });
}

export function gqlMutationOptions<TResult, TVariables extends Record<string, unknown>>(
  query: TypedDocumentString<TResult, TVariables>,
  options?: Omit<UseMutationOptions<TResult, Error, TVariables>, "mutationFn">,
) {
  const mutationKey = ["graph", normalizeQueryKey(query.toString())] as const;

  return buildMutationOptions<TResult, Error, TVariables>({
    mutationKey,
    mutationFn: async (variables) => execute(query, variables as TVariables),
    ...options,
  });
}
