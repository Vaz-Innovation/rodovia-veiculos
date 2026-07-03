import { execute } from "@/graphql/execute";
import { fetchQuery, HydrateClient } from "@/orpc/orpc.server";
import { cacheTag } from "next/cache";
import { FiltersClient } from "./filters-client";
import { getVehicleFilterOptionsQueryOptions, VehicleFilterOptions_Query } from "./query";

/**
 * Cached fetch of the filter dropdown options. `use cache` memoizes the GraphQL
 * response across requests and `cacheTag` lets it be revalidated together with the
 * rest of the inventory (`revalidateTag("vehicle")`) or on its own
 * (`revalidateTag("filter-options")`). The data is returned — not seeded here — so
 * that hydration works on both cache hits and misses (see the slot below).
 */
const loadFilterOptions = async () => {
  "use cache";
  cacheTag("vehicle", "filter-options");
  return execute(VehicleFilterOptions_Query);
};

export default async function FiltersSlot() {
  const data = await loadFilterOptions();

  // Seed the per-request query client with the cached data so `useSuspenseQuery`
  // reads it from the hydration boundary instead of refetching on the client.
  const options = getVehicleFilterOptionsQueryOptions();
  await fetchQuery({ ...options, queryFn: () => data });

  return (
    <HydrateClient>
      <FiltersClient />
    </HydrateClient>
  );
}
