import type { Metadata } from "next";

import { LegalDocument } from "../_components/legal-document";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Saiba como a Rodovia Veículos usa cookies e como você pode controlá-los.",
  robots: { index: false, follow: false },
};

// Slug of the matching page in WordPress.
const WP_SLUG = "politica-de-cookies";

export default function CookiesPage() {
  return <LegalDocument slug={WP_SLUG} kicker="Seus dados" />;
}
