import type { Metadata } from "next";

import { useFragment as getFragment, graphql } from "@/graphql/__gen__";
import { execute } from "@/graphql/execute";
import { gqlQueryOptions } from "@/graphql/gqlpc";
import { formatPrice } from "@/lib/vehicles";
import { fetchQuery, HydrateClient } from "@/orpc/orpc.server";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { VehicleDetailClient } from "./client-page";
import { CarById_Query, VehicleMetadata_ProductFragment } from "./query";
import { Suspense } from "react";
import { AllVehicleIdsQuery } from "@/graphql/__gen__/graphql";
import { SiteHeader } from "@/components/site-header";

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

const ALL_VEHICLE_IDS_QUERY = graphql(`
  query AllVehicleIds($first: Int!, $after: String) {
    products(first: $first, after: $after, where: { status: "publish" }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          databaseId
        }
      }
    }
  }
`);

type AllVehicleIdsResult = {
  products?: {
    pageInfo?: { hasNextPage?: boolean | null; endCursor?: string | null } | null;
    edges?: Array<{ node?: { databaseId?: number | null } | null } | null> | null;
  } | null;
};

// Prebuild a static page for every published vehicle by paginating the catalog.
export async function generateStaticParams(): Promise<RouteParams[]> {
  const params: RouteParams[] = [];
  let after: string | null = null;

  try {
    // Safety-capped loop (100 pages × 100 = 10k vehicles) to avoid a runaway build.
    for (let page = 0; page < 100; page++) {
      const data: AllVehicleIdsQuery = await execute(ALL_VEHICLE_IDS_QUERY, { first: 100, after });

      for (const edge of data.products?.edges ?? []) {
        const id = edge?.node?.databaseId;
        if (id != null) params.push({ vehicleId: String(id) });
      }

      const pageInfo = data.products?.pageInfo;
      if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
      after = pageInfo.endCursor;
    }
  } catch {
    // If the catalog can't be reached at build time, fall back to on-demand
    // generation for every id instead of failing the whole build.
    return params;
  }

  return params;
}

const getProduct = async (id: string) => {
  "use cache";
  try {
    const data = await execute(CarById_Query, { id });
    return data;
  } catch {
    return null;
  }
};

const getProductForSeo = (product: NonNullable<Awaited<ReturnType<typeof getProduct>>>) => {
  return getFragment(VehicleMetadata_ProductFragment, product.product)!;
};

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
  const data = await getProduct(vehicleId);
  const product = data?.product;
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

type LoadedProduct = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

function VehicleDetailFallback() {
  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <div className="pt-32 mx-auto max-w-350 px-6 lg:px-10">
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-4/3 bg-card animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Seeds React Query and hydrates the client. `fetchQuery` reads `Date.now()`
// internally, so this runs inside the Suspense boundary below (a dynamic hole)
// to satisfy Cache Components on this statically-generated route.
async function VehicleDetailContent({
  vehicleId,
  data,
}: {
  vehicleId: string;
  data: LoadedProduct;
}) {
  // Opt this subtree into dynamic (request-time) rendering. `fetchQuery` reads
  // `Date.now()`, which is only allowed once the render depends on request data;
  // paired with the Suspense boundary above, this becomes a streamed dynamic hole.
  await connection();

  await fetchQuery({
    ...gqlQueryOptions(CarById_Query, { input: { id: vehicleId } }),
    queryFn: () => data,
  });

  return (
    <HydrateClient>
      <VehicleDetailClient vehicleId={vehicleId} />
    </HydrateClient>
  );
}

export default async function VehicleDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { vehicleId } = await params;
  const data = await getProduct(vehicleId);
  const product = data?.product;
  if (!product) {
    return notFound();
  }

  const jsonLd = buildVehicleJsonLd(extractSeoFields(getProductForSeo(data)), vehicleId);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<VehicleDetailFallback />}>
        <VehicleDetailContent vehicleId={vehicleId} data={data} />
      </Suspense>
    </>
  );
}
