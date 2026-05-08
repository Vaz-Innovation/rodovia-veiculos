import { useMemo } from "react";
import { TransmissionType, FuelType, VehicleWithPhoto } from "@/lib/vehicles";

export function useVehicleFilters(
  all: VehicleWithPhoto[],
  search: any,
  PAGE_SIZE: number,
  sortKey: string,
) {
  const brandOptions = useMemo(() => Array.from(new Set(all.map((v) => v.brand))).sort(), [all]);
  const modelOptions = useMemo(() => {
    return Array.from(
      new Set(all.filter((v) => !search.brand || v.brand === search.brand).map((v) => v.model)),
    ).sort();
  }, [all, search.brand]);

  const filtered = useMemo(() => filterVehicles(all, search), [all, search]);
  const sorted = useMemo(() => sortVehicles(filtered, sortKey), [filtered, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(search.page, totalPages);
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { brandOptions, modelOptions, filtered, sorted, totalPages, page, pageItems };
}

export function filterVehicles(list: VehicleWithPhoto[], s: any): VehicleWithPhoto[] {
  const q = s.q.trim().toLowerCase();
  return list.filter((v) => {
    if (q) {
      const text = `${v.brand} ${v.model} ${v.version ?? ""}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    if (s.brand && v.brand !== s.brand) return false;
    if (s.model && v.model !== s.model) return false;
    const price = Number(v.price);
    if (s.priceMin !== undefined && price < s.priceMin) return false;
    if (s.priceMax !== undefined && price > s.priceMax) return false;
    if (s.yearMin !== undefined && v.year_model < s.yearMin) return false;
    if (s.yearMax !== undefined && v.year_model > s.yearMax) return false;
    if (s.kmMax !== undefined && v.mileage > s.kmMax) return false;
    if (s.transmission && v.transmission !== (s.transmission as TransmissionType)) return false;
    if (s.fuel && v.fuel !== (s.fuel as FuelType)) return false;
    if (s.color && v.color.toLowerCase() !== s.color.toLowerCase()) return false;
    if (s.features.length > 0) {
      const has = s.features.every((f: string) =>
        v.features.some((vf) => vf.toLowerCase() === f.toLowerCase()),
      );
      if (!has) return false;
    }
    return true;
  });
}

export function sortVehicles(list: VehicleWithPhoto[], sort: string): VehicleWithPhoto[] {
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
