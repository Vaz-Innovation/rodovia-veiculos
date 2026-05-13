import type { Metadata, ResolvingMetadata } from "next";

import { execute } from "@/graphql/execute";
import { VehicleDetailClient } from "./client-page";
import { CarByIdQuery } from "./query";

export async function generateMetadata(
  { params }: { params: Promise<{ vehicleId: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { vehicleId } = await params;

  try {
    const data = await execute(CarByIdQuery, { id: vehicleId });
    const product = data?.product;
    if (!product) return { title: "Veículo não encontrado" };

    const name = product.name ?? "Veículo";

    const imageUrl = product.image?.sourceUrl;
    const parentImages = (await parent).openGraph?.images ?? [];

    return {
      title: name,
      ...(imageUrl && {
        openGraph: {
          images: [{ url: imageUrl, alt: name }, ...parentImages],
        },
        twitter: {
          images: [imageUrl],
        },
      }),
    };
  } catch {
    return { title: "Veículo não encontrado" };
  }
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <VehicleDetailClient vehicleId={vehicleId} />;
}
