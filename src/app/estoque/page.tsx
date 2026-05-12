import type { Metadata } from "next";
import { Suspense } from "react";

import { EstoqueClient } from "./client-page";

const description =
  "Confira nosso estoque de carros semi-novos. Filtre por marca, modelo, preço, ano e mais.";

export const metadata: Metadata = {
  title: "Estoque",
  description,
};

export default function EstoquePage() {
  return (
    <Suspense fallback={null}>
      <EstoqueClient />
    </Suspense>
  );
}
