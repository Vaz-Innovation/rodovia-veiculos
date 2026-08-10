import type { Metadata, Viewport } from "next";

import "../styles.css";
import { Providers } from "./providers";
import { ADDRESS, BUSINESS_NAME, PHONE, SOCIAL } from "@/lib/contact";

const siteDescription = `Tradição e qualidade há 26 anos. Carros semi-novos em ${ADDRESS.short}.`;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rodoviaveiculos.com.br";

const fallbackImage = {
  url: "/images/hero-fallback.jpg",
  width: 1152,
  height: 648,
  type: "image/jpeg",
  alt: `${BUSINESS_NAME} — carros semi-novos em ${ADDRESS.city}`,
} as const;

const autoDealerJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "@id": `${siteUrl}/#dealer`,
  name: BUSINESS_NAME,
  description: siteDescription,
  url: siteUrl,
  image: `${siteUrl}${fallbackImage.url}`,
  telephone: PHONE.e164,
  address: {
    "@type": "PostalAddress",
    addressLocality: ADDRESS.locality,
    addressRegion: ADDRESS.state,
    addressCountry: ADDRESS.country,
  },
  areaServed: { "@type": "City", name: ADDRESS.city },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: BUSINESS_NAME,
    template: `%s | ${BUSINESS_NAME}`,
  },
  description: siteDescription,
  keywords: [
    "carros semi-novos",
    ADDRESS.locality,
    ADDRESS.city,
    ADDRESS.state,
    BUSINESS_NAME,
    "concessionária",
    "veículos usados",
  ],
  applicationName: BUSINESS_NAME,
  openGraph: {
    siteName: BUSINESS_NAME,
    title: BUSINESS_NAME,
    description: siteDescription,
    locale: "pt_BR",
    type: "website",
    images: [fallbackImage],
  },
  twitter: {
    card: "summary_large_image",
    title: BUSINESS_NAME,
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
