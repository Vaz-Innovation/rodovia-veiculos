import type { FormattedExecutionResult } from "graphql";

import { GraphQLResponseError } from "@/lib/graphql/error";
import { toRequestString } from "@/lib/graphql/request-string";
import type { TypedDocumentString } from "./__gen__/graphql";

export const GRAPHQL_ACCEPT = "application/graphql-response+json, application/json";

/**
 * Reads the GraphQL envelope regardless of the HTTP status: servers answering
 * `application/graphql-response+json` may use 4xx/5xx and still carry a
 * well-formed `errors` array, which is what lets callers route on `error.status`.
 */
async function readResult<TResult>(response: Response): Promise<TResult> {
  const body = (await response
    .json()
    .catch(() => null)) as FormattedExecutionResult<TResult> | null;

  if (body?.errors?.length) {
    throw new GraphQLResponseError(body.errors, body.data ?? null, body.extensions);
  }
  if (!body?.data) {
    throw new Error(`O endpoint GraphQL respondeu ${response.status} sem dados`);
  }
  return body.data;
}

/** The browser goes through the Next.js proxy so the WordPress API key never leaves the server. */
function browserRequest(body: string): Promise<Response> {
  return fetch("/api/wordpress/graphql", {
    method: "POST",
    headers: { "content-type": "application/json", accept: GRAPHQL_ACCEPT },
    body,
  });
}

/**
 * Server requests go straight to WordPress. They are deliberately not cached
 * here: caching is decided by the callers (`use cache` in the `_loaders`), where
 * failures can be handled before anything is stored.
 */
function serverRequest(body: string): Promise<Response> {
  const endpoint = process.env.WORDPRESS_API_URL;
  if (!endpoint) {
    throw new Error("WORDPRESS_API_URL is not set for server-side execution");
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: GRAPHQL_ACCEPT,
  };
  if (process.env.WORDPRESS_API_KEY) {
    headers.authorization = `Basic ${process.env.WORDPRESS_API_KEY}`;
  }

  return fetch(endpoint, { method: "POST", headers, body, cache: "no-store" });
}

/**
 * Executes a codegen document. Throws {@link GraphQLResponseError} for any
 * response carrying `errors` (inspect `error.status` / `error.code`), and a plain
 * `Error` for transport failures or an empty body. Wrap calls with `tryCatch`
 * (see `@/lib/try-catch`) to branch on the outcome instead of using try/catch.
 */
export async function execute<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<TResult> {
  const body = JSON.stringify({ query: toRequestString(document), variables });
  const response = await (typeof window === "undefined"
    ? serverRequest(body)
    : browserRequest(body));
  return readResult<TResult>(response);
}
