import type { Metadata } from "next";
import { Suspense } from "react";

import { EstoqueClient } from "./client-page";
import { prefetch } from "@/orpc/orpc.server";
import {
  getCarsListInfiniteQueryOptions,
  getVehicleFilterOptionsQueryOptions,
  carsListSearchParams,
} from "./query";
import { createLoader, SearchParams } from "nuqs/server";

const description =
  "Confira nosso estoque de carros semi-novos. Filtre por marca, modelo, preço, ano e mais.";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rodoviaveiculos.com.br";

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${siteUrl}/estoque#collection`,
      name: "Estoque",
      description,
      url: `${siteUrl}/estoque`,
      isPartOf: { "@id": `${siteUrl}/#dealer` },
      about: { "@id": `${siteUrl}/#dealer` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Estoque" },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Estoque",
  description,
  openGraph: {
    title: "Estoque",
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Estoque",
    description,
  },
  alternates: {
    canonical: "/estoque",
  },
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await createLoader(carsListSearchParams)(searchParams);

  prefetch(getCarsListInfiniteQueryOptions(params), true);
  prefetch(getVehicleFilterOptionsQueryOptions(), true);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Suspense fallback={null}>
        <EstoqueClient />
      </Suspense>
    </>
  );
}
