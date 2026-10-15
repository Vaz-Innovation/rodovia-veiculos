import { cacheLife, cacheTag } from "next/cache";

import type { VehicleFilterOptionsQuery } from "@/graphql/__gen__/graphql";
import { getQueryClient } from "@/lib/query-client";
import { tryCatch } from "@/lib/try-catch";
import { getFilterOptionsQueryOptions } from "../_helpers/query";

/**
 * Dropdown options for the filters sidebar, revalidated with the rest of the
 * inventory (`revalidateTag("vehicle")`) or on its own
 * (`revalidateTag("filter-options")`). The sidebar is secondary, so a failure is
 * handled here — inside the cache scope — by returning empty options for a short
 * while instead of taking the whole listing down or caching the gap for long.
 */
export async function getFilterOptions(): Promise<VehicleFilterOptionsQuery> {
  "use cache";
  cacheTag("vehicle", "filter-options");

  const [options, error] = await tryCatch(
    getQueryClient().fetchQuery(getFilterOptionsQueryOptions()),
  );
  if (error) {
    console.error("[estoque] failed to load filter options", error);
    cacheLife("minutes");
    return {};
  }

  cacheLife("inventory");
  return options;
}
