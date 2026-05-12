import { useCallback } from "react";
import { TransmissionType, FuelType, VehicleWithPhoto } from "@/lib/vehicles";
import { ProductsQuery, CarByIdQuery } from "@/graphql/__gen__/graphql";

export type CarNode = NonNullable<NonNullable<ProductsQuery["products"]>["edges"][0]>["node"];
export type DetailedCarNode = NonNullable<CarByIdQuery["product"]>;

export function useVehicleMapper() {
  return useCallback((node: CarNode | DetailedCarNode): VehicleWithPhoto => {
    const pf = node.productsfields;
    const brands =
      "productBrands" in node ? node.productBrands?.edges?.map((e) => e.node.name) : [];
    const brand = brands?.[0] ?? "";
    const rawPrice = "rawPrice" in node ? node.rawPrice : null;

    let features: string[] = [];

    if (pf?.features?.name) {
      features = pf.features.name
        .split("|")
        .map((f) => f.trim())
        .filter(Boolean);
    }

    return {
      id: String(node.databaseId),
      name: node.name ?? "",
      brand: brand || "",
      model: pf?.model ?? "",
      version: pf?.version ?? "",
      year_model: Number(pf?.yearmodel ?? 0),
      mileage: Number(pf?.mileage ?? 0),
      transmission: pf?.transmission as TransmissionType,
      fuel: pf?.fuel as FuelType,
      color: pf?.color ?? "",
      features,
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
        ...("galleryImages" in node && node.galleryImages?.nodes
          ? node.galleryImages.nodes
              .map((img, i) => ({
                id: `${node.id}-gallery-${i}`,
                url: img.sourceUrl ?? "",
                is_cover: false,
                position: i + 1,
                created_at: node.date ?? "",
                storage_path: null,
                vehicle_id: node.id,
              }))
              .filter((p) => !!p.url)
          : []),
      ],
      description: null,
      doors: null,
      plate_end: null,
      status: "disponivel",
      updated_at: node.date ?? "",
      year_manufacture: Number(pf?.yearmodel ?? 0),
    };
  }, []);
}
