export const SORT_OPTIONS = ["recent", "price_asc", "price_desc", "year_desc", "km_asc"] as const;
export type SearchSort = (typeof SORT_OPTIONS)[number];

export interface SearchParams {
  search: string;
  productBrand: string;
  model: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  yearMin: number | undefined;
  yearMax: number | undefined;
  kmMax: number | undefined;
  transmission: string;
  fuel: string;
  condition: string;
  color: string;
  tagIn: string[];
  category: string;
  sort: SearchSort;
}

/** A single filter option with display label and API slug. */
export interface VehicleFilterOption {
  name: string;
  slug: string;
}

/** Tags are filtered by numeric ID (WC's tagIdIn), so we carry the database ID. */
export interface VehicleFilterTagOption extends VehicleFilterOption {
  id: number;
}

/** Options that come from the API (taxonomy queries). */
export interface VehicleFilterApiOptions {
  brands: VehicleFilterOption[];
  categories: VehicleFilterOption[];
  tags: VehicleFilterTagOption[];
  models: VehicleFilterOption[];
  transmissions: VehicleFilterOption[];
  fuels: VehicleFilterOption[];
  colors: VehicleFilterOption[];
  conditions: VehicleFilterOption[];
}

const EMPTY: VehicleFilterOption[] = [];
const EMPTY_TAGS: VehicleFilterTagOption[] = [];

// All filtering and sorting now happens server-side via the GraphQL where args
// (brand/category/tag/attribute taxonomies, price, year/km ranges, attribute orderby).
// The hook just unpacks dropdown options coming from the filter-options query.
export function useVehicleFilters(apiOptions?: VehicleFilterApiOptions) {
  return {
    brandOptions: apiOptions?.brands ?? EMPTY,
    modelOptions: apiOptions?.models ?? EMPTY,
    categoryOptions: apiOptions?.categories ?? EMPTY,
    tagOptions: apiOptions?.tags ?? EMPTY_TAGS,
    transmissionOptions: apiOptions?.transmissions ?? EMPTY,
    fuelOptions: apiOptions?.fuels ?? EMPTY,
    colorOptions: apiOptions?.colors ?? EMPTY,
    conditionOptions: apiOptions?.conditions ?? EMPTY,
  };
}
