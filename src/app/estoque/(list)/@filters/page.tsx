import { tryCatch } from "@/lib/try-catch";
import { FiltersClient } from "./filters-client";
import { getFilterOptions } from "./_loaders/get-filter-options";

export default async function FiltersSlot() {
  const [options, error] = await tryCatch(getFilterOptions());
  if (error) console.error("[estoque] failed to load filter options", error);

  // The options don't depend on the request, so they're passed straight to the
  // client as props. The sidebar is secondary: if they can't be loaded it renders
  // with empty dropdowns rather than taking the whole listing down with it.
  return <FiltersClient data={options ?? {}} />;
}
