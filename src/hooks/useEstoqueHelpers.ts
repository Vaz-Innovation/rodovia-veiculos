import { SearchParams, useVehicleFilters } from "@/hooks/useVehicleFilters";
import { VehicleWithPhoto } from "@/lib/vehicles";

export function useEstoqueHelpers(all: VehicleWithPhoto[], search: SearchParams, sortKey: string) {
  return useVehicleFilters(all, search, sortKey);
}
