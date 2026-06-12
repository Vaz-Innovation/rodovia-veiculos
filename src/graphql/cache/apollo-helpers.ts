import type { ApolloCache } from '@apollo/client';
import type { DocumentNode } from 'graphql';
import { parse } from 'graphql';

/**
 * Parses a GraphQL query string into a DocumentNode for Apollo Cache
 */
export function parseGraphQLQuery(queryString: string): DocumentNode {
  try {
    return parse(queryString);
  } catch (error) {
    console.error('Failed to parse GraphQL query:', error);
    throw error;
  }
}

/**
 * Writes query data to Apollo Cache
 */
export function writeQueryToApolloCache<TData>(
  cache: ApolloCache,
  queryString: string,
  variables: Record<string, unknown> | undefined,
  data: TData,
): void {
  try {
    const query = parseGraphQLQuery(queryString);
    cache.writeQuery({
      query,
      variables: variables ?? undefined,
      data,
    });
  } catch (error) {
    console.error('Failed to write query to Apollo cache:', error);
  }
}

/**
 * Reads query data from Apollo Cache
 */
export function readQueryFromApolloCache<TData>(
  cache: ApolloCache,
  queryString: string,
  variables: Record<string, unknown> | undefined,
): TData | null {
  try {
    const query = parseGraphQLQuery(queryString);
    return cache.readQuery<TData>({
      query,
      variables: variables ?? undefined,
    });
  } catch {
    // Apollo returns null if query is not in cache or has missing fields
    return null;
  }
}

/**
 * Evicts a query from Apollo Cache
 */
export function evictQueryFromApolloCache(
  cache: ApolloCache,
  queryString: string,
  variables: Record<string, unknown> | undefined,
): boolean {
  try {
    const query = parseGraphQLQuery(queryString);
    return cache.evict({
      id: 'ROOT_QUERY',
      fieldName: extractOperationName(query),
      args: variables,
    });
  } catch (error) {
    console.error('Failed to evict query from Apollo cache:', error);
    return false;
  }
}

/**
 * Extracts the operation name from a DocumentNode
 */
function extractOperationName(document: DocumentNode): string | undefined {
  const definition = document.definitions[0];
  if (definition?.kind === 'OperationDefinition') {
    return definition.name?.value;
  }
  return undefined;
}

/**
 * Checks if a query key is a GraphQL query key
 */
export function isGraphQLQueryKey(
  queryKey: readonly unknown[],
): queryKey is readonly ['graph', string, Record<string, unknown>] {
  return (
    Array.isArray(queryKey) &&
    queryKey.length === 3 &&
    queryKey[0] === 'graph' &&
    typeof queryKey[1] === 'string' &&
    (typeof queryKey[2] === 'object' || queryKey[2] === undefined)
  );
}

/**
 * Checks if a mutation key is a GraphQL mutation key
 */
export function isGraphQLMutationKey(
  mutationKey: readonly unknown[] | undefined,
): mutationKey is readonly ['graph', string] {
  return (
    Array.isArray(mutationKey) &&
    mutationKey.length === 2 &&
    mutationKey[0] === 'graph' &&
    typeof mutationKey[1] === 'string'
  );
}
