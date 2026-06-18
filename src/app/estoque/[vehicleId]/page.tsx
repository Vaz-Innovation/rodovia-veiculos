import { cache } from "react";
import type { Metadata } from "next";

import { execute } from "@/graphql/execute";
import { VehicleDetailClient } from "./client-page";
import { getCarByIdQueryOptions, VehicleMetadata_Query } from "./query";
import { prefetch } from "@/orpc/orpc.server";
import { formatPrice } from "@/lib/vehicles";

type RouteParams = { vehicleId: string };

type AttributeNode = { name?: string | null; options?: (string | null)[] | null };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rodoviaveiculos.com.br";

function pickAttribute(nodes: AttributeNode[] | null | undefined, name: string): string {
  const attr = nodes?.find((a) => a?.name?.toLowerCase() === name);
  return attr?.options?.[0] ?? "";
}

function stripHtml(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const getProductForSeo = cache(async (id: string) => {
  try {
    const data = await execute(VehicleMetadata_Query, { id });
    return data?.product ?? null;
  } catch {
    return null;
  }
});

function extractSeoFields(product: NonNullable<Awaited<ReturnType<typeof getProductForSeo>>>) {
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
    [priceStr, mileageStr, "Rodovia Veículos — Sobradinho, Brasília — DF"]
      .filter(Boolean)
      .join(" · ");
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

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { vehicleId } = await params;
  const product = await getProductForSeo(vehicleId);
  if (!product) {
    return { title: "Veículo não encontrado" };
  }

  const seo = extractSeoFields(product);
  const images = seo.image ? [{ url: seo.image, alt: seo.headline }] : undefined;

  return {
    title: seo.headline,
    description: seo.description,
    openGraph: {
      title: seo.headline,
      description: seo.description,
      type: "website",
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.headline,
      description: seo.description,
      ...(seo.image && { images: [seo.image] }),
    },
    alternates: {
      canonical: `/estoque/${vehicleId}`,
    },
  };
}

function buildVehicleJsonLd(
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

export default async function VehicleDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { vehicleId } = await params;

  prefetch(getCarByIdQueryOptions(vehicleId));

  const product = await getProductForSeo(vehicleId);
  const jsonLd = product ? buildVehicleJsonLd(extractSeoFields(product), vehicleId) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <VehicleDetailClient vehicleId={vehicleId} />
    </>
  );
}
