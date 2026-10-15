import { nullIfNotFound } from "@/lib/error-status";
import { runQuery } from "@/lib/run-query";
import { getLegalPageQueryOptions } from "../_helpers/query";

/**
 * Fetches a WordPress page by slug. Returns `null` when the page doesn't exist
 * or isn't published (the server-side API key can also see drafts/private pages,
 * which must never reach the public site), including a backend 404. Cached by
 * the query's `init` policy; other failures throw.
 */
export async function getLegalPage(slug: string) {
  const data = await nullIfNotFound(runQuery(getLegalPageQueryOptions(slug)));
  const page = data?.page;
  if (!page || page.status !== "publish") return null;

  return { title: page.title ?? "", content: page.content ?? "", modified: page.modified ?? null };
}
