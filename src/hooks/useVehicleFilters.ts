import { useMemo } from "react";
import { TransmissionType, FuelType, VehicleWithPhoto } from "@/lib/vehicles";
import {
  RootQueryToProductConnectionWhereArgs,
  ProductsOrderByEnum,
  OrderEnum,
} from "@/graphql/__gen__/graphql";

export const SORT_OPTIONS = ["recent", "price_asc", "price_desc", "year_desc", "km_asc"] as const;
export type SearchSort = (typeof SORT_OPTIONS)[number];

export interface SearchParams {
  q: string;
  brand: string;
  model: string;
  priceMin: number | undefined;
  priceMax: number | undefined;
  yearMin: number | undefined;
  yearMax: number | undefined;
  kmMax: number | undefined;
  transmission: string;
  fuel: string;
  color: string;
  tags: string[];
  category: string;
  sort: SearchSort;
}

export function useVehicleFilters(all: VehicleWithPhoto[], search: SearchParams, sortKey: string) {
  const brandOptions = useMemo(() => Array.from(new Set(all.map((v) => v.brand))).sort(), [all]);
  const modelOptions = useMemo(() => {
    return Array.from(
      new Set(all.filter((v) => !search.brand || v.brand === search.brand).map((v) => v.model)),
    ).sort();
  }, [all, search.brand]);
  const categoryOptions = useMemo(
    () => Array.from(new Set(all.flatMap((v) => v.categories))).sort(),
    [all],
  );
  const tagOptions = useMemo(() => Array.from(new Set(all.flatMap((v) => v.tags))).sort(), [all]);

  const filtered = useMemo(() => filterVehicles(all, search), [all, search]);
  const sorted = useMemo(() => sortVehicles(filtered, sortKey), [filtered, sortKey]);

  return { brandOptions, modelOptions, categoryOptions, tagOptions, filtered, sorted };
}

export function buildWhereArgs(s: SearchParams): RootQueryToProductConnectionWhereArgs {
  const where: RootQueryToProductConnectionWhereArgs = {};

  if (s.q?.trim()) {
    where.search = s.q.trim();
  }

  if (s.brand) {
    where.productBrand = s.brand;
  }

  if (s.category) {
    where.category = s.category;
  }

  if (s.priceMin !== undefined) {
    where.minPrice = s.priceMin;
  }

  if (s.priceMax !== undefined) {
    where.maxPrice = s.priceMax;
  }

  switch (s.sort) {
    case "price_asc":
      where.orderby = [{ field: ProductsOrderByEnum.Price, order: OrderEnum.Asc }];
      break;
    case "price_desc":
      where.orderby = [{ field: ProductsOrderByEnum.Price, order: OrderEnum.Desc }];
      break;
    default:
      where.orderby = [{ field: ProductsOrderByEnum.Date, order: OrderEnum.Desc }];
      break;
  }

  return where;
}

function filterVehicles(list: VehicleWithPhoto[], s: SearchParams): VehicleWithPhoto[] {
  return list.filter((v) => {
    if (s.model && v.model !== s.model) return false;
    if (s.yearMin !== undefined && v.year_model < s.yearMin) return false;
    if (s.yearMax !== undefined && v.year_model > s.yearMax) return false;
    if (s.kmMax !== undefined && v.mileage > s.kmMax) return false;
    if (s.transmission && v.transmission !== (s.transmission as TransmissionType)) return false;
    if (s.fuel && v.fuel !== (s.fuel as FuelType)) return false;
    if (s.color && v.color.toLowerCase() !== s.color.toLowerCase()) return false;
    if (s.tags.length > 0 && !s.tags.some((t) => v.tags.includes(t))) return false;
    return true;
  });
}

function sortVehicles(list: VehicleWithPhoto[], sort: string): VehicleWithPhoto[] {
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
