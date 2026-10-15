import { describe, expect, it } from "vitest";

import { GraphQLResponseError } from "@/lib/graphql/error";
import { isNotFoundError, nullIfNotFound, resolveErrorStatus } from "./error-status";

const graphqlError = (extensions: Record<string, unknown>) =>
  new GraphQLResponseError([{ message: "failed", extensions }]);

describe("resolveErrorStatus", () => {
  it("reads the status derived from a GraphQL error code", () => {
    expect(resolveErrorStatus(graphqlError({ code: "NOT_FOUND" }))).toBe(404);
    expect(resolveErrorStatus(graphqlError({ code: "FORBIDDEN" }))).toBe(403);
  });

  it("prefers an explicit `extensions.status` over the code", () => {
    expect(resolveErrorStatus(graphqlError({ code: "INTERNAL_SERVER_ERROR", status: 404 }))).toBe(
      404,
    );
  });

  it("reads the status of any error-like object (e.g. ORPCError)", () => {
    expect(resolveErrorStatus({ status: 401, code: "UNAUTHORIZED" })).toBe(401);
  });

  it("is undefined when there is no numeric status", () => {
    expect(resolveErrorStatus(new Error("plain"))).toBeUndefined();
    expect(resolveErrorStatus(graphqlError({ code: "SOMETHING_ELSE" }))).toBeUndefined();
    expect(resolveErrorStatus({ status: "404" })).toBeUndefined();
    expect(resolveErrorStatus(null)).toBeUndefined();
    expect(resolveErrorStatus("404")).toBeUndefined();
  });
});

describe("isNotFoundError", () => {
  it("is true only for a 404", () => {
    expect(isNotFoundError(graphqlError({ code: "NOT_FOUND" }))).toBe(true);
    expect(isNotFoundError(graphqlError({ code: "INTERNAL_SERVER_ERROR" }))).toBe(false);
    expect(isNotFoundError(new Error("network down"))).toBe(false);
    expect(isNotFoundError(undefined)).toBe(false);
  });
});

describe("nullIfNotFound", () => {
  it("passes the resolved value through", async () => {
    await expect(nullIfNotFound(Promise.resolve({ id: 1 }))).resolves.toEqual({ id: 1 });
  });

  it("maps a backend 404 to null", async () => {
    await expect(
      nullIfNotFound(Promise.reject(graphqlError({ code: "NOT_FOUND" }))),
    ).resolves.toBeNull();
  });

  it("rethrows every other failure untouched", async () => {
    const serverError = graphqlError({ code: "INTERNAL_SERVER_ERROR" });
    const networkError = new Error("fetch failed");

    await expect(nullIfNotFound(Promise.reject(serverError))).rejects.toBe(serverError);
    await expect(nullIfNotFound(Promise.reject(networkError))).rejects.toBe(networkError);
  });
});
