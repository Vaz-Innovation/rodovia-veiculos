import type { Metadata } from "next";

import { VehicleFormClient } from "./vehicle-form-client";

export const metadata: Metadata = {
  title: "Editar veículo — Rodovia Veículos",
  robots: { index: false, follow: false },
};

export default async function AdminVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VehicleFormClient id={id} />;
}
