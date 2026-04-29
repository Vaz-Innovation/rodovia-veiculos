import type { Metadata } from "next";

import "../styles.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Rodovia Veículos",
  description: "Tradição e qualidade há 26 anos.",
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
