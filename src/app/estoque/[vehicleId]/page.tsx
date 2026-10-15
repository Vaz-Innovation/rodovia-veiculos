import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SiteHeader } from "@/components/site-header";
import { tryCatch } from "@/lib/try-catch";
import { VehicleDetailClient } from "./client-page";
import { buildVehicleJsonLd, extractSeoFields, getProductForSeo } from "./_helpers/seo";
import { getAllVehicleIds } from "./_loaders/get-all-vehicle-ids";
import { getVehicle } from "./_loaders/get-vehicle";

type RouteParams = { vehicleId: string };

// Prebuild a static page for every published vehicle by paginating the catalog.
export async function generateStaticParams(): Promise<RouteParams[]> {
  const [result, error] = await tryCatch(getAllVehicleIds());
  if (error) {
    // Unreachable catalog at build time: log it and fall back to on-demand
    // generation instead of failing on a transient error.
    console.error("[estoque/[vehicleId]] generateStaticParams failed", error);
    return [];
  }
  if (result.error) {
    // A later page failed. The ids collected before it are still prebuilt; the
    // vehicles that were missed are generated on their first visit and cached.
    console.warn(
      `[estoque/[vehicleId]] generateStaticParams is partial (${result.ids.length} ids)`,
      result.error,
    );
  }

  return result.ids.map((vehicleId) => ({ vehicleId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { vehicleId } = await params;

  // `null` is a missing vehicle (a regular outcome: the page itself calls
  // `notFound()`); an error is a real failure and must surface, not be cached.
  const [data, error] = await tryCatch(getVehicle(vehicleId));
  if (error) throw error;
  if (!data) {
    return { title: "Veículo não encontrado" };
  }

  const seo = extractSeoFields(getProductForSeo(data));
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

/**
 * Reads `params` inside the page's `<Suspense>` boundary so the route keeps a
 * shared App Shell (the fallback). Vehicles returned by `generateStaticParams`
 * are fully prerendered; new ones get the shell instantly and are upgraded to a
 * static page after the first visit. Every data access here is cached and the
 * product is handed to the client component as a prop (no server-side React
 * Query, whose `Date.now()` reads would force the content out of the prerender).
 */
async function VehicleDetail({ params }: { params: Promise<RouteParams> }) {
  const { vehicleId } = await params;

  const [data, error] = await tryCatch(getVehicle(vehicleId));
  if (error) throw error;
  if (!data) notFound();

  const jsonLd = buildVehicleJsonLd(extractSeoFields(getProductForSeo(data)), vehicleId);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VehicleDetailClient product={data.product} />
    </>
  );
}

export default function VehicleDetailPage({ params }: { params: Promise<RouteParams> }) {
  return (
    <Suspense fallback={<VehicleDetailFallback />}>
      <VehicleDetail params={params} />
    </Suspense>
  );
}
