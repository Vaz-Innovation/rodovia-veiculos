import type { ApolloCache } from '@apollo/client';
import type { Query, QueryKey } from '@tanstack/react-query';
import { notifyManager, QueryCache } from '@tanstack/react-query';

import {
  evictQueryFromApolloCache,
  isGraphQLQueryKey,
  readQueryFromApolloCache,
  writeQueryToApolloCache,
} from './apollo-helpers';

/**
 * GraphQueryCache integrates React Query with Apollo Cache for GraphQL queries.
 *
 * When a query key starts with "graph", this cache:
 * 1. Stores query results in Apollo's normalized cache
 * 2. Retrieves data from Apollo cache on subsequent requests
 * 3. Handles cache invalidation through Apollo's cache system
 *
 * Query key structure: ["graph", queryString, variables]
 */
export class GraphQueryCache extends QueryCache {
  constructor(
    private apolloCache: ApolloCache,
    config?: ConstructorParameters<typeof QueryCache>[0],
  ) {
    super(config);

    // Set up notification listener for query updates
    this.subscribe(
      notifyManager.batchCalls((event) => {
        if (event?.type === 'updated' && event.query) {
          this.handleQueryUpdate(event.query);
        }
      }),
    );
  }

  /**
   * Handles query updates and syncs to Apollo Cache
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleQueryUpdate(query: Query<any, any, any, any>): void {
    if (!isGraphQLQueryKey(query.queryKey)) {
      return;
    }

    if (query.state.status === 'success' && query.state.data !== undefined) {
      const [, queryString, variables] = query.queryKey;
      writeQueryToApolloCache(
        this.apolloCache,
        queryString as string,
        variables as Record<string, unknown>,
        query.state.data,
      );
    }
  }

  /**
   * Override add to track GraphQL queries
   */
  override add<
    TQueryFnData = unknown,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = readonly unknown[],
  >(query: Query<TQueryFnData, TError, TData, TQueryKey>): void {
    // Add to React Query cache
    super.add(query);

    // For GraphQL queries, try to hydrate from Apollo Cache immediately
    if (isGraphQLQueryKey(query.queryKey)) {
      this.hydrateQueryFromApollo(query);
    }
  }

  /**
   * Override remove to evict from Apollo Cache
   */
  override remove(query: Query): void {
    // Evict from Apollo Cache if it's a GraphQL query
    if (isGraphQLQueryKey(query.queryKey)) {
      const [, queryString, variables] = query.queryKey;
      evictQueryFromApolloCache(
        this.apolloCache,
        queryString as string,
        variables as Record<string, unknown>,
      );
    }

    // Remove from React Query cache
    super.remove(query);
  }

  /**
   * Hydrates a query's state from Apollo Cache if available
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private hydrateQueryFromApollo(query: Query<any, any, any, any>): void {
    if (!isGraphQLQueryKey(query.queryKey)) {
      return;
    }

    // Only hydrate if query doesn't have fresh data
    if (query.state.status === 'success' && query.state.dataUpdatedAt) {
      const timeSinceUpdate = Date.now() - query.state.dataUpdatedAt;
      if (timeSinceUpdate < 1000) {
        // Data is fresh (less than 1 second old), don't hydrate
        return;
      }
    }

    const [, queryString, variables] = query.queryKey;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cachedData = readQueryFromApolloCache<any>(
      this.apolloCache,
      queryString as string,
      variables as Record<string, unknown>,
    );

    if (cachedData !== null) {
      // Update query state with Apollo cached data
      query.setState({
        data: cachedData,
        dataUpdateCount: query.state.dataUpdateCount + 1,
        dataUpdatedAt: Date.now(),
        error: null,
        errorUpdateCount: 0,
        errorUpdatedAt: 0,
        fetchFailureCount: 0,
        fetchFailureReason: null,
        fetchMeta: null,
        fetchStatus: 'idle',
        status: 'success',
      });
    }
  }

  /**
   * Clears Apollo cache entries for removed queries
   */
  override clear(): void {
    // Get all GraphQL queries before clearing
    const graphqlQueries = this.getAll().filter((query) =>
      isGraphQLQueryKey(query.queryKey),
    );

    // Evict them from Apollo Cache
    graphqlQueries.forEach((query) => {
      if (isGraphQLQueryKey(query.queryKey)) {
        const [, queryString, variables] = query.queryKey;
        evictQueryFromApolloCache(
          this.apolloCache,
          queryString as string,
          variables as Record<string, unknown>,
        );
      }
    });

    // Clear React Query cache
    super.clear();
  }
}
