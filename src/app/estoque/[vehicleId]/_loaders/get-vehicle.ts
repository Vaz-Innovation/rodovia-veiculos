import { cacheLife, cacheTag } from "next/cache";

import { isNotFoundError, nullIfNotFound } from "@/lib/error-status";
import { getQueryClient } from "@/lib/query-client";
import { isMissingProductError } from "../_helpers/errors";
import { getVehicleQueryOptions } from "../_helpers/query";

/**
 * A vehicle by WordPress database id, or `null` when it doesn't exist (WPGraphQL
 * for WooCommerce answers a "No product exists…" field error; other backends a
 * 404 error or `{ product: null }`). "Doesn't
 * exist" is a stable fact worth caching; transport and other GraphQL errors
 * throw, so a transient failure is never cached as "not found".
 */
export async function getVehicle(id: string) {
  "use cache";
  cacheLife("inventory");
  cacheTag("vehicle", `vehicle:${id}`);

  const data = await nullIfNotFound(
    getQueryClient().fetchQuery(getVehicleQueryOptions(id)),
    (error) => isNotFoundError(error) || isMissingProductError(error),
  );
  return data?.product ? data : null;
}
