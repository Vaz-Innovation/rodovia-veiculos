import {
  Vehicle,
  TRANSMISSION_OPTIONS,
  FUEL_OPTIONS,
  COLOR_OPTIONS,
  CONDITION_OPTIONS,
} from "@/lib/vehicles";
import { useMemo } from "react";

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

/** Options that come from the API (taxonomy queries). */
export interface VehicleFilterApiOptions {
  brands: VehicleFilterOption[];
  categories: VehicleFilterOption[];
  tags: VehicleFilterOption[];
}

export function useVehicleFilters(
  all: Vehicle[],
  search: SearchParams,
  sortKey: string,
  apiOptions?: VehicleFilterApiOptions,
) {
  const brandOptions = useMemo(
    () =>
      apiOptions?.brands ??
      Array.from(new Set(all.map((v) => v.brand)))
        .sort()
        .map((n) => ({ name: n, slug: n })),
    [apiOptions?.brands, all],
  );
  const modelOptions = useMemo(
    () =>
      Array.from(new Set(all.map((v) => v.model)))
        .filter(Boolean)
        .sort(),
    [all],
  );
  const categoryOptions = useMemo(
    () =>
      apiOptions?.categories ??
      Array.from(new Set(all.flatMap((v) => v.categories)))
        .sort()
        .map((n) => ({ name: n, slug: n })),
    [apiOptions?.categories, all],
  );
  const tagOptions = useMemo(
    () =>
      apiOptions?.tags ??
      Array.from(new Set(all.flatMap((v) => v.tags ?? [])))
        .sort()
        .map((n) => ({ name: n, slug: n })),
    [apiOptions?.tags, all],
  );

  const transmissionOptions = TRANSMISSION_OPTIONS;
  const fuelOptions = FUEL_OPTIONS;
  const colorOptions = COLOR_OPTIONS;
  const conditionOptions = CONDITION_OPTIONS;

  const filtered = useMemo(() => filterVehicles(all, search), [all, search]);
  const sorted = useMemo(() => sortVehicles(filtered, sortKey), [filtered, sortKey]);

  return {
    brandOptions,
    modelOptions,
    categoryOptions,
    tagOptions,
    transmissionOptions,
    fuelOptions,
    colorOptions,
    conditionOptions,
    filtered,
    sorted,
  };
}

function filterVehicles(list: Vehicle[], s: SearchParams): Vehicle[] {
  return list.filter((v) => {
    if (s.model && v.model !== s.model) return false;
    if (s.transmission && v.transmission !== s.transmission) return false;
    if (s.fuel && v.fuel !== s.fuel) return false;
    if (s.color && v.color !== s.color) return false;
    if (s.condition && v.condition !== s.condition) return false;
    if (s.yearMin !== undefined && v.year_model < s.yearMin) return false;
    if (s.yearMax !== undefined && v.year_model > s.yearMax) return false;
    if (s.kmMax !== undefined && v.mileage > s.kmMax) return false;
    return true;
  });
}

function sortVehicles(list: Vehicle[], sort: string): Vehicle[] {
  const copy = [...list];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => Number(a.price) - Number(b.price));
    case "price_desc":
      return copy.sort((a, b) => Number(b.price) - Number(a.price));
    case "year_desc":
      return copy.sort((a, b) => b.year_model - a.year_model);
    case "km_asc":
      return copy.sort((a, b) => a.mileage - b.mileage);
    default:
      return copy.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
}
