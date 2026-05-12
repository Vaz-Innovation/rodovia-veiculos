import { CarByIdQuery, ProductsPaginatedQuery } from "@/graphql/__gen__/graphql";
import { useVehicleFilters, SearchParams } from "@/hooks/useVehicleFilters";
import { FuelType, TransmissionType, VehicleWithPhoto } from "@/lib/vehicles";

export function useEstoqueHelpers(all: VehicleWithPhoto[], search: SearchParams, sortKey: string) {
  return useVehicleFilters(all, search, sortKey);
}

type DetailedCarNode = NonNullable<CarByIdQuery["product"]>;

function mapProductToVehicle(node: DetailedCarNode): VehicleWithPhoto {
  const pf = node.productsfields;
  const rawPrice = "rawPrice" in node ? node.rawPrice : null;

  return {
    id: node.id,
    name: node.name ?? "",
    brand: "",
    model: pf?.model ?? "",
    version: pf?.version ?? "",
    year_model: Number(pf?.yearmodel ?? 0),
    mileage: Number(pf?.mileage ?? 0),
    transmission: pf?.transmission as TransmissionType,
    fuel: pf?.fuel as FuelType,
    color: pf?.color ?? "",
    features: pf?.features?.name
      ? pf.features.name
          .split("|")
          .map((f) => f.trim())
          .filter(Boolean)
      : [],
    categories: [],
    tags: [],
    price: Number(rawPrice ?? 0),
    featured: Boolean(pf?.featured),
    created_at: node.date ?? "",
    vehicle_photos: [
      ...(node.image?.sourceUrl
        ? [
            {
              id: `${node.id}-main`,
              url: node.image.sourceUrl,
              is_cover: true,
              position: 0,
              created_at: node.date ?? "",
              storage_path: null,
              vehicle_id: node.id,
            },
          ]
        : []),
    ],
    description: null,
    doors: null,
    plate_end: null,
    status: "disponivel",
    updated_at: node.date ?? "",
    year_manufacture: Number(pf?.yearmodel ?? 0),
  };
}
