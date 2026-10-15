import type { Metadata } from "next";

import { LegalDocument } from "../_components/legal-document";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Leia os termos e condições de uso dos serviços da Rodovia Veículos.",
  robots: { index: false, follow: false },
};

// Slug of the matching page in WordPress.
const WP_SLUG = "termos-de-servico";

export default function TermsPage() {
  return <LegalDocument slug={WP_SLUG} kicker="Condições" />;
}
