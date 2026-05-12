import { useCallback } from "react";
import { TransmissionType, FuelType, VehicleWithPhoto } from "@/lib/vehicles";
import { ProductsPaginatedQuery, CarByIdQuery } from "@/graphql/__gen__/graphql";

export type CarNode = NonNullable<NonNullable<ProductsPaginatedQuery["products"]>["edges"][0]>["node"];
export type DetailedCarNode = NonNullable<CarByIdQuery["product"]>;

type AttributeNode = {
  name: string;
  options?: (string | null)[] | null;
};

function getAttributeValue(attributes: AttributeNode[] | undefined | null, name: string): string {
  const attr = attributes?.find((a) => a.name.toLowerCase() === name.toLowerCase());
  return attr?.options?.[0] ?? "";
}

function getAttributeValues(attributes: AttributeNode[] | undefined | null, name: string): string[] {
  const attr = attributes?.find((a) => a.name.toLowerCase() === name.toLowerCase());
  return attr?.options?.filter((o): o is string => !!o) ?? [];
}

export function useVehicleMapper() {
  return useCallback((node: CarNode | DetailedCarNode): VehicleWithPhoto => {
    const attributes = "attributes" in node ? node.attributes?.nodes : undefined;
    const brands =
      "productBrands" in node ? node.productBrands?.edges?.map((e) => e.node.name) : [];
    const brand = brands?.[0] ?? "";
    const rawPrice = "rawPrice" in node ? node.rawPrice : null;

    const model = getAttributeValue(attributes, "model");
    const version = getAttributeValue(attributes, "version");
    const yearModel = getAttributeValue(attributes, "yearmodel");
    const mileage = getAttributeValue(attributes, "mileage");
    const transmission = getAttributeValue(attributes, "transmission");
    const fuel = getAttributeValue(attributes, "fuel");
    const color = getAttributeValue(attributes, "color");
    const featured = getAttributeValue(attributes, "featured");
    const features = getAttributeValues(attributes, "features");

    return {
      id: String(node.databaseId),
      name: node.name ?? "",
      brand: brand || "",
      model: model,
      version: version,
      year_model: Number(yearModel) || 0,
      mileage: Number(mileage) || 0,
      transmission: transmission as TransmissionType,
      fuel: fuel as FuelType,
      color: color,
      features: features,
      price: Number(rawPrice ?? 0),
      featured: featured === "true" || featured === "1" || featured === "sim",
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
      year_manufacture: Number(yearModel) || 0,
    };
  }, []);
}
