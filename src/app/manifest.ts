import type { MetadataRoute } from "next";

import { ADDRESS, BUSINESS_NAME } from "@/lib/contact";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BUSINESS_NAME,
    short_name: "Rodovia",
    description: `Tradição e qualidade há 26 anos. Carros semi-novos em ${ADDRESS.short}.`,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "pt-BR",
    categories: ["automotive", "shopping"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
