import { useCallback } from "react";
import { Vehicle } from "@/lib/vehicles";
import {
  Estoque_ProductsFragmentFragment,
  VehicleDetail_ProductsFragmentFragment,
} from "@/graphql/__gen__/graphql";

export type CarNode = Estoque_ProductsFragmentFragment;
export type DetailedCarNode = VehicleDetail_ProductsFragmentFragment;

type AttributeNode = {
  name?: string | null;
  options?: (string | null)[] | null;
};

function getAttributeValue(attributes: AttributeNode[] | undefined | null, name: string): string {
  const attr = attributes?.find((a) => a.name?.toLowerCase() === name.toLowerCase());
  return attr?.options?.[0] ?? "";
}

function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  return html.replace(/<[^>]*>/g, "").trim() || null;
}

export function useVehicleMapper() {
  return useCallback((node: CarNode | DetailedCarNode): Vehicle => {
    const attributes = "attributes" in node ? node.attributes?.nodes : undefined;
    const tags =
      "productTags" in node
        ? node.productTags?.nodes?.map((e) => e.name).filter((t): t is string => !!t)
        : [];
    const categories =
      "productCategories" in node
        ? (node.productCategories?.edges ?? [])
            .map((e) => e?.node?.name)
            .filter((n): n is string => !!n)
        : [];
    const rawPrice = "rawPrice" in node ? node.rawPrice : null;
    const description = "shortDescription" in node ? stripHtml(node.shortDescription) : null;
    const featured = "featured" in node ? node.featured : false;
    const model = getAttributeValue(attributes, "pa_model");
    const version = getAttributeValue(attributes, "pa_version");
    const yearModel = getAttributeValue(attributes, "pa_yearmodel");
    const yearManufacture = getAttributeValue(attributes, "pa_yearassembly");
    const mileage = getAttributeValue(attributes, "pa_mileage");
    const transmission = getAttributeValue(attributes, "pa_transmission");
    const fuel = getAttributeValue(attributes, "pa_fuel");
    const color = getAttributeValue(attributes, "pa_color");
    const doors = getAttributeValue(attributes, "pa_doors");
    const plateEnd = getAttributeValue(attributes, "pa_plate_end");
    const city = getAttributeValue(attributes, "pa_city");
    const district = getAttributeValue(attributes, "pa_district");
    const engine = getAttributeValue(attributes, "pa_engine");
    const condition = getAttributeValue(attributes, "pa_condition");
    const brand = getAttributeValue(attributes, "rm_marca");

    return {
      id: String(node.databaseId),
      name: node.name ?? "",
      brand: brand || "",
      model: model,
      tags: tags || [],
      categories,
      version: version,
      year_model: Number(yearModel) || 0,
      mileage: Number(mileage) || 0,
      transmission: transmission,
      fuel: fuel,
      color: color,
      price: Number(rawPrice ?? 0),
      featured: featured || false,
      created_at: node.date ?? "",
      photos: [
        node.image?.sourceUrl ?? null,
        ...("galleryImages" in node && node.galleryImages?.nodes
          ? node.galleryImages.nodes.map((img) => img.sourceUrl ?? null)
          : []),
      ].filter((url): url is string => !!url),
      description: description,
      doors: doors ? Number(doors) : null,
      plate_end: plateEnd || null,
      updated_at: node.date ?? "",
      year_manufacture: Number(yearManufacture) || Number(yearModel) || 0,
      city: city || null,
      district: district || null,
      engine: engine || null,
      condition: condition || null,
    };
  }, []);
}
