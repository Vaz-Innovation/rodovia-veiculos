import type { ExecuteInit } from "./execute";

/** How long inventory data may be served before it is refetched in the background. */
export const INVENTORY_REVALIDATE = 15 * 60;

/**
 * Cache policy for inventory data (listings, vehicles, filter options): tagged
 * `vehicle` so the WooCommerce webhook (`/api/cars/purge`) purges all of it at
 * once, plus any narrower tags for targeted invalidation.
 */
export const inventoryCache = (...tags: string[]): ExecuteInit => ({
  next: { tags: ["vehicle", ...tags], revalidate: INVENTORY_REVALIDATE },
});
