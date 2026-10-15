import { runQuery } from "@/lib/run-query";
import { getFilterOptionsQueryOptions } from "../_helpers/query";

/**
 * Dropdown options for the filters sidebar. Cached by the query's `init` policy,
 * revalidated with the rest of the inventory (`revalidateTag("vehicle")`) or on
 * its own (`revalidateTag("filter-options")`). Failures throw.
 */
export async function getFilterOptions() {
  return runQuery(getFilterOptionsQueryOptions());
}
