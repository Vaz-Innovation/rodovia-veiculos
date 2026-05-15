import type { Metadata, Viewport } from "next";

import "../styles.css";
import { Providers } from "./providers";

const siteDescription =
  "Tradição e qualidade há 26 anos. Carros semi-novos em Sobradinho, Brasília — DF.";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rodoviaveiculos.com.br";

const fallbackImage = {
  url: "/images/hero-fallback.jpg",
  width: 1280,
  height: 853,
  alt: "Rodovia Veículos — carros semi-novos em Brasília",
} as const;

const autoDealerJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "@id": `${siteUrl}/#dealer`,
  name: "Rodovia Veículos",
  description: siteDescription,
  url: siteUrl,
  image: `${siteUrl}${fallbackImage.url}`,
  telephone: "+5561999719187",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sobradinho",
    addressRegion: "DF",
    addressCountry: "BR",
  },
  areaServed: { "@type": "City", name: "Brasília" },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rodovia Veículos",
    template: "%s | Rodovia Veículos",
  },
  description: siteDescription,
  keywords: [
    "carros semi-novos",
    "Sobradinho",
    "Brasília",
    "DF",
    "Rodovia Veículos",
    "concessionária",
    "veículos usados",
  ],
  applicationName: "Rodovia Veículos",
  openGraph: {
    siteName: "Rodovia Veículos",
    title: "Rodovia Veículos",
    description: siteDescription,
    locale: "pt_BR",
    type: "website",
    images: [fallbackImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rodovia Veículos",
    description: siteDescription,
    images: [fallbackImage.url],
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(autoDealerJsonLd) }}
        />
        <Providers>
          <div id="root">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
