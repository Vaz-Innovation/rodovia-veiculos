import { useFragment as getFragment } from "@/graphql/__gen__";
import type { CarByIdQuery } from "@/graphql/__gen__/graphql";
import { ADDRESS, BUSINESS_NAME } from "@/lib/contact";
import { formatPrice } from "@/lib/vehicles";
import { VehicleMetadata_ProductFragment } from "./query";

type AttributeNode = { name?: string | null; options?: (string | null)[] | null };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rodoviaveiculos.com.br";

export function pickAttribute(nodes: AttributeNode[] | null | undefined, name: string): string {
  const attr = nodes?.find((a) => a?.name?.toLowerCase() === name);
  return attr?.options?.[0] ?? "";
}

export function stripHtml(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Unmasks the SEO fragment of a loaded vehicle. */
export const getProductForSeo = (data: { product?: CarByIdQuery["product"] }) => {
  return getFragment(VehicleMetadata_ProductFragment, data.product)!;
};

export function extractSeoFields(
  product: NonNullable<Awaited<ReturnType<typeof getProductForSeo>>>,
) {
  const attributes = "attributes" in product ? (product.attributes?.nodes ?? null) : null;
  const brand = pickAttribute(attributes, "pa_brand");
  const model = pickAttribute(attributes, "pa_model");
  const year = pickAttribute(attributes, "pa_yearmodel");
  const mileage = pickAttribute(attributes, "pa_mileage");
  const fuel = pickAttribute(attributes, "pa_fuel");
  const transmission = pickAttribute(attributes, "pa_transmission");
  const color = pickAttribute(attributes, "pa_color");
  const doors = pickAttribute(attributes, "pa_doors");
  const version = pickAttribute(attributes, "pa_version");

  const headline =
    [brand, model, year].filter(Boolean).join(" ").trim() || product.name || "Veículo";
  const priceNum = "price" in product ? Number(product.price) : NaN;
  const priceStr = Number.isFinite(priceNum) ? formatPrice(priceNum) : null;
  const mileageStr = mileage ? `${Number(mileage).toLocaleString("pt-BR")} km` : null;
  const shortDesc = stripHtml(product.shortDescription);
  const description =
    shortDesc ||
    [priceStr, mileageStr, `${BUSINESS_NAME} — ${ADDRESS.short}`].filter(Boolean).join(" · ");
  const image = product.image?.sourceUrl ?? null;

  return {
    headline,
    description,
    image,
    brand,
    model,
    year,
    mileage,
    fuel,
    transmission,
    color,
    doors,
    version,
    price: Number.isFinite(priceNum) ? priceNum : null,
    name: product.name ?? null,
  };
}

export function buildVehicleJsonLd(
  seo: ReturnType<typeof extractSeoFields>,
  vehicleId: string,
): Record<string, unknown> {
  const url = `${siteUrl}/estoque/${vehicleId}`;
  const mileageInt = Number.parseInt(seo.mileage, 10);
  const doorsInt = Number.parseInt(seo.doors, 10);

  const car: Record<string, unknown> = {
    "@type": "Car",
    "@id": `${url}#car`,
    name: seo.headline,
    url,
    description: seo.description,
    ...(seo.image && { image: seo.image }),
    ...(seo.brand && { brand: { "@type": "Brand", name: seo.brand } }),
    ...(seo.model && { model: seo.model }),
    ...(seo.year && { vehicleModelDate: seo.year }),
    ...(seo.version && { vehicleConfiguration: seo.version }),
    ...(Number.isFinite(mileageInt) && {
      mileageFromOdometer: {
        "@type": "QuantitativeValue",
        value: mileageInt,
        unitCode: "KMT",
      },
    }),
    ...(seo.fuel && { fuelType: seo.fuel }),
    ...(seo.transmission && { vehicleTransmission: seo.transmission }),
    ...(seo.color && { color: seo.color }),
    ...(Number.isFinite(doorsInt) && { numberOfDoors: doorsInt }),
    ...(seo.price != null && {
      offers: {
        "@type": "Offer",
        price: seo.price,
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
        url,
        seller: { "@id": `${siteUrl}/#dealer` },
      },
    }),
  };

  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Estoque", item: `${siteUrl}/estoque` },
      { "@type": "ListItem", position: 3, name: seo.headline },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [car, breadcrumbs],
  };
}
