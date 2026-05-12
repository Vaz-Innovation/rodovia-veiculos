import type { Metadata, Viewport } from "next";

import "../styles.css";
import { Providers } from "./providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rodoviaveiculos.com.br/";
const siteDescription =
  "Tradição e qualidade há 26 anos. Carros semi-novos em Sobradinho, Brasília — DF.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rodovia Veículos",
    template: "%s | Rodovia Veículos",
  },
  description: siteDescription,
  keywords: [
    "carros semi-novos",
    "veículos usados",
    "Brasília",
    "Sobradinho",
    "DF",
    "rodovia veículos",
    "comprar carro",
    "revenda de veículos",
  ],
  authors: [{ name: "Rodovia Veículos", url: siteUrl }],
  creator: "Rodovia Veículos",
  publisher: "Rodovia Veículos",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Rodovia Veículos",
    title: "Rodovia Veículos",
    description: siteDescription,
    images: [
      {
        url: "/images/hero-fallback.jpg",
        width: 1280,
        height: 853,
        alt: "Rodovia Veículos — carros semi-novos em Brasília",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rodovia Veículos",
    description: siteDescription,
    images: ["/images/hero-fallback.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div id="root">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
