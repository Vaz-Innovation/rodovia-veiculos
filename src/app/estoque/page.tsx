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

export const metadata: Metadata = {
  title: "Estoque",
  description,
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await createLoader(carsListSearchParams)(searchParams);

  prefetch(getCarsListInfiniteQueryOptions(params), true);
  prefetch(getVehicleFilterOptionsQueryOptions(), true);

  return (
    <Suspense fallback={null}>
      <EstoqueClient />
    </Suspense>
  );
}
