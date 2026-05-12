import { useCallback } from "react";
import { TransmissionType, FuelType, VehicleWithPhoto } from "@/lib/vehicles";
import { ProductsPaginatedQuery, CarByIdQuery } from "@/graphql/__gen__/graphql";

export type CarNode = NonNullable<NonNullable<ProductsPaginatedQuery["products"]>["edges"][0]>["node"];
export type DetailedCarNode = NonNullable<CarByIdQuery["product"]>;

type AttributeNode = {
  name?: string | null;
  options?: (string | null)[] | null;
};

function getAttributeValue(attributes: AttributeNode[] | undefined | null, name: string): string {
  const attr = attributes?.find((a) => a.name?.toLowerCase() === name.toLowerCase());
  return attr?.options?.[0] ?? "";
}

function getAttributeValues(attributes: AttributeNode[] | undefined | null, name: string): string[] {
  const attr = attributes?.find((a) => a.name?.toLowerCase() === name.toLowerCase());
  return attr?.options?.filter((o): o is string => !!o) ?? [];
}

function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  return html.replace(/<[^>]*>/g, "").trim() || null;
}

export function useVehicleMapper() {
  return useCallback((node: CarNode | DetailedCarNode): VehicleWithPhoto => {
    const attributes = "attributes" in node ? node.attributes?.nodes : undefined;
    const brands =
      "productBrands" in node ? node.productBrands?.edges?.map((e) => e.node.name) : [];
    const rawPrice = "rawPrice" in node ? node.rawPrice : null;
    const description = "description" in node ? stripHtml(node.description) : null;

    // WooCommerce attributes use "pa_" prefix (product attribute)
    const model = getAttributeValue(attributes, "pa_model");
    const version = getAttributeValue(attributes, "pa_version");
    const yearModel = getAttributeValue(attributes, "pa_yearmodel");
    const yearManufacture = getAttributeValue(attributes, "pa_yearassembly");
    const mileage = getAttributeValue(attributes, "pa_mileage");
    const transmission = getAttributeValue(attributes, "pa_transmission");
    const fuel = getAttributeValue(attributes, "pa_fuel");
    const color = getAttributeValue(attributes, "pa_color");
    const featured = getAttributeValue(attributes, "pa_featured");
    const features = getAttributeValues(attributes, "pa_features");
    const doors = getAttributeValue(attributes, "pa_doors");
    const plateEnd = getAttributeValue(attributes, "pa_plate_end");
    const city = getAttributeValue(attributes, "pa_city");
    const district = getAttributeValue(attributes, "pa_district");
    const engine = getAttributeValue(attributes, "pa_engine");
    const condition = getAttributeValue(attributes, "pa_condition");
    // Brand can come from productBrands taxonomy or rm_marca attribute
    const brandFromAttr = getAttributeValue(attributes, "rm_marca");
    const brand = brands?.[0] ?? brandFromAttr ?? "";

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
      description: description,
      doors: doors ? Number(doors) : null,
      plate_end: plateEnd || null,
      status: "disponivel",
      updated_at: node.date ?? "",
      year_manufacture: Number(yearManufacture) || Number(yearModel) || 0,
      city: city || null,
      district: district || null,
      engine: engine || null,
      condition: condition || null,
    };
  }, []);
}
