import type { Metadata, Viewport } from "next";

import "../styles.css";
import { Providers } from "./providers";

const siteDescription =
  "Tradição e qualidade há 26 anos. Carros semi-novos em Sobradinho, Brasília — DF.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://rodoviaveiculos.com.br"),
  title: {
    default: "Rodovia Veículos",
    template: "%s | Rodovia Veículos",
  },
  description: siteDescription,
  openGraph: {
    siteName: "Rodovia Veículos",
    locale: "pt_BR",
    type: "website",
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
    images: ["/images/hero-fallback.jpg"],
  },
};

export const viewport: Viewport = {
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
