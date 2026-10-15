import type { Metadata } from "next";

import { LegalDocument } from "../_components/legal-document";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Leia nossa política de privacidade e saiba como tratamos seus dados na Rodovia Veículos.",
  robots: { index: false, follow: false },
};

// Slug of the matching page in WordPress.
const WP_SLUG = "politica-de-privacidade";

export default function PrivacyPage() {
  return <LegalDocument slug={WP_SLUG} kicker="Seus dados" />;
}
