import { cacheLife, cacheTag } from "next/cache";

import { nullIfNotFound } from "@/lib/error-status";
import { getQueryClient } from "@/lib/query-client";
import { getLegalPageQueryOptions } from "../_helpers/query";

/**
 * Fetches a WordPress page by slug. Returns `null` when the page doesn't exist
 * or isn't published (the server-side API key can also see drafts/private pages,
 * which must never reach the public site), including a backend 404. Other
 * transport and GraphQL errors throw, so a transient failure isn't cached as a
 * "not found".
 */
export async function getLegalPage(slug: string) {
  "use cache";
  cacheTag("page", `page:${slug}`);
  cacheLife("hours");

  const data = await nullIfNotFound(getQueryClient().fetchQuery(getLegalPageQueryOptions(slug)));
  const page = data?.page;
  if (!page || page.status !== "publish") return null;

  return { title: page.title ?? "", content: page.content ?? "", modified: page.modified ?? null };
}
