import { describe, expect, it } from "vitest";

import { GraphQLResponseError } from "@/lib/graphql/error";
import { getGraphCache, getQueryClient, makeQueryClient } from "./query-client";

describe("query client (server)", () => {
  it("creates a new client and graph cache per call, so requests never share state", () => {
    expect(getQueryClient()).not.toBe(getQueryClient());
    expect(getGraphCache()).not.toBe(getGraphCache());
  });

  it("never retries on the server", () => {
    const retry = makeQueryClient().getDefaultOptions().queries?.retry as (
      failureCount: number,
      error: Error,
    ) => boolean;

    expect(retry(0, new Error("network"))).toBe(false);
  });

  it("serializes with SuperJSON so Dates and undefined survive dehydration", () => {
    const { dehydrate, hydrate } = makeQueryClient().getDefaultOptions();
    const date = new Date("2026-01-01T00:00:00Z");

    expect(dehydrate?.serializeData?.({ date })).toMatchObject({ meta: expect.anything() });
    expect(hydrate?.deserializeData?.(dehydrate?.serializeData?.({ date }))).toEqual({ date });
  });

  it("dehydrates pending queries and does not redact errors", () => {
    const { dehydrate } = makeQueryClient().getDefaultOptions();

    expect(dehydrate?.shouldRedactErrors?.(new Error("x"))).toBe(false);
  });
});

describe("query client retry policy (browser)", () => {
  it("retries transport failures up to 3 times, but never GraphQL errors", async () => {
    const { environmentManager } = await import("@tanstack/react-query");
    environmentManager.setIsServer(() => false);
    try {
      const retry = makeQueryClient().getDefaultOptions().queries?.retry as (
        failureCount: number,
        error: Error,
      ) => boolean;
      const graphqlError = new GraphQLResponseError([{ message: "nope" }]);

      expect(retry(0, new Error("network"))).toBe(true);
      expect(retry(2, new Error("network"))).toBe(true);
      expect(retry(3, new Error("network"))).toBe(false);
      expect(retry(0, graphqlError)).toBe(false);
    } finally {
      environmentManager.setIsServer(() => typeof window === "undefined");
    }
  });
});
