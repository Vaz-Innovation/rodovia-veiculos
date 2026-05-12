import type { MetadataRoute } from "next";
import { executeRaw } from "@/graphql/execute";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rodovia.veiculos.com.br";

const staticRoutes: MetadataRoute.Sitemap = [
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
];

type ProductsResult = {
  products?: {
    pageInfo?: { hasNextPage: boolean; endCursor?: string | null };
    edges?: Array<{ node: { databaseId: number; date?: string | null } }>;
  };
};

async function fetchAllProductIds(): Promise<Array<{ id: number; date: string | null }>> {
  const query = `
    query SitemapProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo { hasNextPage endCursor }
        edges { node { databaseId date } }
      }
    }
  `;

  const ids: Array<{ id: number; date: string | null }> = [];
  let cursor: string | null = null;

  // Page through all products (max 10 iterations = 1000 vehicles)
  for (let i = 0; i < 10; i++) {
    const variables: Record<string, unknown> = { first: 100 };
    if (cursor) variables.after = cursor;

    const data = await executeRaw<ProductsResult>(query, variables);
    const edges = data?.products?.edges ?? [];

    for (const edge of edges) {
      ids.push({ id: edge.node.databaseId, date: edge.node.date ?? null });
    }

    const pageInfo = data?.products?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
    cursor = pageInfo.endCursor;
  }

  return ids;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let vehicleEntries: MetadataRoute.Sitemap = [];

  try {
    const products = await fetchAllProductIds();
    vehicleEntries = products.map(({ id, date }) => ({
      url: `${siteUrl}/estoque/${id}`,
      lastModified: date ? new Date(date) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Sitemap degrades gracefully if WordPress is unreachable at build time
  }

  return [...staticRoutes, ...vehicleEntries];
}
