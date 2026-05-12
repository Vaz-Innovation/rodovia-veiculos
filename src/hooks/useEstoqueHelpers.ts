import { useVehicleFilters } from "@/hooks/useVehicleFilters";
import { VehicleWithPhoto } from "@/lib/vehicles";

export function useEstoqueHelpers(
  all: VehicleWithPhoto[],
  search: any,
  PAGE_SIZE: number,
  sortKey: string,
) {
  return useVehicleFilters(all, search, PAGE_SIZE, sortKey);
}
