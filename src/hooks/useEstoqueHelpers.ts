import { CarByIdQuery, ProductsPaginatedQuery } from "@/graphql/__gen__/graphql";
import { useVehicleFilters } from "@/hooks/useVehicleFilters";
import { FuelType, TransmissionType, VehicleWithPhoto } from "@/lib/vehicles";

export function useEstoqueHelpers(
  all: VehicleWithPhoto[],
  search: any,
  PAGE_SIZE: number,
  sortKey: string,
) {
  return useVehicleFilters(all, search, PAGE_SIZE, sortKey);
}

type CarNode = NonNullable<NonNullable<ProductsPaginatedQuery["products"]>["edges"][0]>["node"];
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
    features: Array.isArray(pf?.features)
      ? pf.features.map((f) => f.name).filter((name): name is string => !!name)
      : pf?.features?.name
        ? [pf.features.name]
        : [],
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
