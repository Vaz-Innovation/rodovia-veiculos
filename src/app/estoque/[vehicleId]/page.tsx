import type { Metadata, ResolvingMetadata } from "next";

import { execute } from "@/graphql/execute";
import { VehicleDetailClient } from "./client-page";
import { getCarByIdQueryOptions } from "./query";
import { prefetch } from "@/orpc/orpc.server";

// export async function generateMetadata(
//   { params }: { params: Promise<{ vehicleId: string }> },
//   parent: ResolvingMetadata,
// ): Promise<Metadata> {
//   const { vehicleId } = await params;

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;

  prefetch(getCarByIdQueryOptions(vehicleId));

  return <VehicleDetailClient vehicleId={vehicleId} />;
}
