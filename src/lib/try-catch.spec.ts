import { notFound, redirect } from "next/navigation";
import { describe, expect, it } from "vitest";

import { GraphQLResponseError } from "@/lib/graphql/error";
import { tryCatch } from "./try-catch";

describe("tryCatch", () => {
  describe("promises", () => {
    it("resolves to [data, null]", async () => {
      expect(await tryCatch(Promise.resolve(42))).toEqual([42, null]);
    });

    it("resolves to [null, error] when the promise rejects", async () => {
      const error = new Error("boom");
      expect(await tryCatch(Promise.reject(error))).toEqual([null, error]);
    });

    it("keeps the GraphQLResponseError instance so callers can read `status`", async () => {
      const error = new GraphQLResponseError([
        { message: "missing", extensions: { code: "NOT_FOUND" } },
      ]);

      const [data, caught] = await tryCatch(Promise.reject(error));

      expect(data).toBeNull();
      expect(caught).toBe(error);
      expect((caught as GraphQLResponseError).status).toBe(404);
    });

    it("re-throws notFound() instead of capturing it", async () => {
      await expect(
        tryCatch(
          Promise.resolve().then(() => {
            notFound();
          }),
        ),
      ).rejects.toMatchObject({ digest: expect.stringContaining("404") });
    });

    it("re-throws redirect() instead of capturing it", async () => {
      await expect(
        tryCatch(
          Promise.resolve().then(() => {
            redirect("/elsewhere");
          }),
        ),
      ).rejects.toMatchObject({ digest: expect.stringContaining("NEXT_REDIRECT") });
    });
  });

  describe("synchronous functions", () => {
    it("returns [value, null]", () => {
      expect(tryCatch(() => "ok")).toEqual(["ok", null]);
    });

    it("returns [null, error] when the function throws", () => {
      const error = new Error("sync boom");
      expect(
        tryCatch(() => {
          throw error;
        }),
      ).toEqual([null, error]);
    });

    it("re-throws Next.js control-flow errors", () => {
      expect(() => tryCatch(() => notFound())).toThrow();
    });
  });
});
