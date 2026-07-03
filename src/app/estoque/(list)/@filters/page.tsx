import { Suspense } from "react";

import { execute } from "@/graphql/execute";
import { fetchQuery, HydrateClient } from "@/orpc/orpc.server";
import { cacheTag } from "next/cache";
import { connection } from "next/server";
import { FiltersClient } from "./filters-client";
import { getVehicleFilterOptionsQueryOptions, VehicleFilterOptions_Query } from "./query";
import Loading from "./loading";

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
  // Opt into dynamic (request-time) rendering so the `Date.now()` inside
  // `fetchQuery` is allowed; the Suspense boundary above streams this hole.
  await connection();

  const data = await loadFilterOptions();
  // `fetchQuery` seeds React Query, which internally reads `Date.now()`. On this
  // otherwise-static slot that current-time access must live inside a Suspense
  // boundary (a dynamic hole) to satisfy Cache Components.
  return (
    <Suspense fallback={<Loading />}>
      <FiltersContent data={data} />
    </Suspense>
  );
}

async function FiltersContent({ data }: { data: Awaited<ReturnType<typeof loadFilterOptions>> }) {
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
