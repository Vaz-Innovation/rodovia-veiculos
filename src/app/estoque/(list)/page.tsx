import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { createLoader, type SearchParams } from "nuqs/server";

import { execute } from "@/graphql/execute";
import { fetchInfiniteQuery, HydrateClient } from "@/orpc/orpc.server";
import { ProductsClient } from "./products-client";
import {
  buildProductsWhere,
  CarsListPaginated_Query,
  carsListSearchParams,
  getCarsListInfiniteQueryOptions,
  PAGE_SIZE,
  productCacheTags,
  type CarsListParams,
} from "./query";

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

/**
 * Cached fetch of the first ProductsPaginated page for the current filter set.
 * `use cache` keys the result on `params`, and `cacheTag` attaches the constant
 * `vehicle` tag plus the active filter values so cached SSR renders can be
 * revalidated broadly (`revalidateTag("vehicle")`) or per filter
 * (`revalidateTag(brandSlug)`). The raw page is returned and seeded outside the
 * cache boundary so hydration is correct on both cache hits and misses.
 */
const loadCarsFirstPage = async (params: CarsListParams) => {
  "use cache";
  cacheTag(...productCacheTags(params));
  const where = buildProductsWhere(params);
  return execute(CarsListPaginated_Query, { first: PAGE_SIZE, after: undefined, where });
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await createLoader(carsListSearchParams)(searchParams);

  const firstPage = await loadCarsFirstPage(params);
  // Seed the infinite query with the cached first page so the client hydrates
  // instead of refetching. Subsequent pages are fetched client-side as usual.
  const options = getCarsListInfiniteQueryOptions(params);
  await fetchInfiniteQuery({ ...options, queryFn: async () => firstPage });

  return (
    <HydrateClient>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <ProductsClient />
    </HydrateClient>
  );
}
