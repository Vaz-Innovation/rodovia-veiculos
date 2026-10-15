import { tryCatch } from "@/lib/try-catch";
import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { getSitemapProducts } from "./_loaders/get-sitemap-products";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rodoviaveiculos.com.br";

const staticRoutes = (): MetadataRoute.Sitemap => [
  {
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${siteUrl}/estoque`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/delivery`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${siteUrl}/contato`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${siteUrl}/localizacao`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${siteUrl}/privacidade`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${siteUrl}/termos`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${siteUrl}/cookies`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

/**
 * Cached for an hour and purged with the rest of the inventory via the `vehicle`
 * tag. `new Date()` is only allowed here because it runs inside the `use cache`
 * scope, so the timestamp is frozen with the cached entry.
 */
async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheTag("vehicle", "sitemap");

  const [result, error] = await tryCatch(getSitemapProducts());
  const failure = error ?? result.error;
  if (failure) {
    console.error("[sitemap] failed to load all vehicles", failure);
  }
  // A complete sitemap is cached for an hour. A degraded one (static routes only,
  // or the vehicles collected before a page failed) is retried within minutes, so
  // the next build of this entry fills in what was missing.
  cacheLife(failure ? "minutes" : "hours");

  const vehicleEntries: MetadataRoute.Sitemap = (result?.products ?? []).map(({ id, date }) => ({
    url: `${siteUrl}/estoque/${id}`,
    lastModified: date ? new Date(date) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes(), ...vehicleEntries];
}

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap();
}
