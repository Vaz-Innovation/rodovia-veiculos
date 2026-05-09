import type { Metadata } from "next";

import { VehicleDetailClient } from "./client-page";

export const metadata: Metadata = {
  title: "Detalhes do veículo — Rodovia Veículos",
};

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  return <VehicleDetailClient vehicleId={vehicleId} />;
}
