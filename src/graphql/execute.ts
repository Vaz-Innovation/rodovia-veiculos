/* eslint-disable @typescript-eslint/no-explicit-any */
import { addTypenameToDocument } from "@apollo/client/utilities";
import type { TypedDocumentString } from "./__gen__/graphql";
import { parse, print } from "graphql";

const cache = new WeakMap<TypedDocumentString<any, any>, string>();

function toRequestString(doc: TypedDocumentString<any, any>): string {
  const hit = cache.get(doc);
  if (hit) return hit;
  const transformed = print(addTypenameToDocument(parse(doc.toString())));
  cache.set(doc, transformed);
  return transformed;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

type RawVariables = Record<string, unknown> | null | undefined;

async function runGraphQLRequest<TResult>(
  query: TypedDocumentString<any, any>,
  variables?: RawVariables,
): Promise<TResult> {
  const isServer = typeof window === "undefined";
  const endpoint = isServer ? process.env.WORDPRESS_API_URL : "/api/wordpress/graphql";

  if (!endpoint) {
    throw new Error("WORDPRESS_API_URL is not set for server-side execution");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/graphql-response+json",
  };

  if (isServer && process.env.WORDPRESS_API_KEY) {
    headers.Authorization = `Basic ${process.env.WORDPRESS_API_KEY}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: toRequestString(query),
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL HTTP Error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as GraphQLResponse<TResult>;

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join(", "));
  }

  if (!json.data) {
    throw new Error("GraphQL response missing data field");
  }

  return json.data;
}

export async function execute<
  TResult,
  TVariables extends Record<string, unknown> = Record<string, never>,
>(query: TypedDocumentString<TResult, TVariables>, variables?: TVariables): Promise<TResult> {
  return runGraphQLRequest<TResult>(query, variables);
}
