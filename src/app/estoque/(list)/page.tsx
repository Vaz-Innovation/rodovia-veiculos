import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { createLoader, type SearchParams } from "nuqs/server";

import { ProductsClient } from "./products-client";
import { carsListSearchParams } from "./_helpers/query";
import { getCarsFirstPage } from "./_loaders/get-cars-first-page";

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

  // The cached first page, dehydrated, seeds the client query so it hydrates
  // instead of refetching (`null` if WordPress failed: the client fetches it).
  // Subsequent pages are fetched client-side as usual.
  const dehydratedState = await getCarsFirstPage(params);

  return (
    <HydrationBoundary state={dehydratedState ?? undefined}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <ProductsClient />
    </HydrationBoundary>
  );
}
