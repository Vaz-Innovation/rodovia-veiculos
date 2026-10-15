import type { FormattedExecutionResult } from "graphql";

import { GraphQLResponseError } from "@/lib/graphql/error";
import { toRequestString } from "@/lib/graphql/request-string";
import type { TypedDocumentString } from "./__gen__/graphql";

/**
 * Per-operation options, passed as `execute`'s third argument (or `init` in
 * `gqlQueryOptions`). On the server, `next` goes straight to Next.js's `fetch`:
 * the response is stored in the Data Cache with these `tags` and `revalidate`
 * (and both propagate to the route), exactly like `fetch(url, { next })`. In the
 * browser it is ignored.
 */
export interface ExecuteInit {
  next?: {
    tags?: string[];
    /** Seconds; `false` caches until a tag is revalidated. */
    revalidate?: number | false;
  };
}

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
 * Server requests go straight to WordPress. With `init.next` they are cached in
 * the Data Cache (`force-cache` + tags/revalidate). The Data Cache only stores
 * `200` responses, so a failed operation is never cached as long as WordPress
 * answers errors with a non-2xx status — which the `wpgraphql-error-status`
 * plugin (docker/wordpress/plugins) guarantees; WPGraphQL alone answers resolver
 * errors with `200`.
 */
function serverRequest(body: string, init?: ExecuteInit): Promise<Response> {
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

  return fetch(endpoint, {
    method: "POST",
    headers,
    body,
    ...(init?.next && { cache: "force-cache", next: init.next }),
  });
}

/**
 * Executes a codegen document. Throws {@link GraphQLResponseError} for any
 * response carrying `errors` (inspect `error.status` / `error.code`), and a plain
 * `Error` for transport failures or an empty body. Wrap calls with `tryCatch`
 * (see `@/lib/try-catch`) to branch on the outcome instead of using try/catch.
 */
export async function execute<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  ...[variables, init]: TVariables extends Record<string, never>
    ? [variables?: undefined, init?: ExecuteInit]
    : [variables: TVariables, init?: ExecuteInit]
): Promise<TResult> {
  const body = JSON.stringify({ query: toRequestString(document), variables });
  const response = await (typeof window === "undefined"
    ? serverRequest(body, init)
    : browserRequest(body));
  return readResult<TResult>(response);
}
