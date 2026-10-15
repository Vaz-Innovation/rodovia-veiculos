import { FiltersClient } from "./filters-client";
import { getFilterOptions } from "./_loaders/get-filter-options";

export default async function FiltersSlot() {
  // The options don't depend on the request, so they're passed straight to the
  // client as props (empty if WordPress failed, see the loader).
  return <FiltersClient data={await getFilterOptions()} />;
}
