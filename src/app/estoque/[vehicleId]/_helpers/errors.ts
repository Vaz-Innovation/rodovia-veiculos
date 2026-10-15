import { GraphQLResponseError } from "@/lib/graphql/error";

/**
 * WPGraphQL for WooCommerce answers `product(id: …)` for an unknown id with a
 * field error (HTTP 200, no `extensions.code`, `path: ["product"]`) instead of
 * `{ product: null }`, so `error.status` can't tell it apart from a real failure.
 * The match is deliberately narrow — path AND message — so a transient resolver
 * error is never mistaken for a missing vehicle (and cached as one).
 */
const MISSING_PRODUCT = /^No product (exists with|ID was found corresponding to) the database_id/;

export function isMissingProductError(error: unknown): boolean {
  return (
    GraphQLResponseError.is(error) &&
    error.errors.length > 0 &&
    error.errors.every((e) => e.path?.[0] === "product" && MISSING_PRODUCT.test(e.message))
  );
}
