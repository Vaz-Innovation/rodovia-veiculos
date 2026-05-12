import type { Metadata } from "next";

import { execute } from "@/graphql/execute";
import { VehicleDetailClient } from "./client-page";
import { CarByIdQuery } from "./query";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}): Promise<Metadata> {
  const { vehicleId } = await params;

  try {
    const data = await execute(CarByIdQuery, { id: vehicleId });
    const product = data?.product;
    if (!product) return { title: "Veículo não encontrado" };

    const name = product.name ?? "Veículo";
    const pf = product.productsfields;

    const specs = [
      pf?.yearmodel,
      pf?.mileage ? `${Number(pf.mileage).toLocaleString("pt-BR")} km` : null,
      pf?.transmission,
      pf?.fuel,
    ]
      .filter(Boolean)
      .join(" · ");

    const description = specs
      ? `${name} — ${specs}. Confira no estoque da Rodovia Veículos.`
      : `Confira os detalhes do ${name} no estoque da Rodovia Veículos.`;

    const imageUrl = product.image?.sourceUrl;

    return {
      title: name,
      description,
      openGraph: {
        title: name,
        description,
        type: "website",
        images: imageUrl ? [{ url: imageUrl, alt: name }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: name,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
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
