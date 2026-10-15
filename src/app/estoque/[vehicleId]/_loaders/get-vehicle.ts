import { nullIfNotFound } from "@/lib/error-status";
import { runQuery } from "@/lib/run-query";
import { getVehicleQueryOptions } from "../_helpers/query";

/**
 * A vehicle by WordPress database id, or `null` when it doesn't exist (WPGraphQL
 * answers `{ product: null }`; other backends answer a 404 error). Cached by the
 * query's `init` policy; other failures throw.
 */
export async function getVehicle(id: string) {
  const data = await nullIfNotFound(runQuery(getVehicleQueryOptions(id)));
  return data?.product ? data : null;
}
