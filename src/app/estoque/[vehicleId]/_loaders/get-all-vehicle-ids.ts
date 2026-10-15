import { collectAllPages } from "@/graphql/paginate";
import { runQuery } from "@/lib/run-query";
import { getAllVehicleIdsQueryOptions } from "../_helpers/query";

export interface VehicleIds {
  ids: string[];
  /** Set when a later page failed: `ids` is then only what was collected before it. */
  error: Error | null;
}

// Safety cap: 100 pages × 100 = 10k vehicles, to avoid a runaway build.
const MAX_PAGES = 100;

/**
 * Database ids of every published vehicle. A failure after the first page returns
 * what was collected plus the `error`; a failure on the first page throws.
 */
export async function getAllVehicleIds(): Promise<VehicleIds> {
  const { nodes, error } = await collectAllPages(async (after) => {
    const data = await runQuery(getAllVehicleIdsQueryOptions(after));
    return {
      nodes: (data.products?.edges ?? []).map((edge) => edge?.node),
      hasNextPage: data.products?.pageInfo?.hasNextPage,
      endCursor: data.products?.pageInfo?.endCursor,
    };
  }, MAX_PAGES);

  return {
    ids: nodes.flatMap((node) => (node?.databaseId != null ? [String(node.databaseId)] : [])),
    error,
  };
}
