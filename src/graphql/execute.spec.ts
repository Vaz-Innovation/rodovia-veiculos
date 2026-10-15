import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GraphQLResponseError } from "@/lib/graphql/error";
import type { TypedDocumentString } from "./__gen__/graphql";
import { execute } from "./execute";

type NoVariables = Record<string, never>;

const document = <TVariables = NoVariables>(source: string) =>
  ({ toString: () => source }) as unknown as TypedDocumentString<{ ok: boolean }, TVariables>;

/** Resolves to whatever the promise rejects with (typed for assertions on `status`/`code`). */
const failureOf = async (promise: Promise<unknown>) =>
  (await promise.then(
    () => {
      throw new Error("expected the promise to reject");
    },
    (error: unknown) => error,
  )) as GraphQLResponseError & { status?: number };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("execute (server)", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("WORDPRESS_API_URL", "https://wp.test/graphql");
    vi.stubEnv("WORDPRESS_API_KEY", "secret");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("returns `data` on success", async () => {
    fetchMock.mockResolvedValue(json({ data: { ok: true } }));

    await expect(execute(document("query A { ok }"))).resolves.toEqual({ ok: true });
  });

  it("posts the document (with __typename) and variables to the WordPress endpoint", async () => {
    fetchMock.mockResolvedValue(json({ data: { ok: true } }));

    await execute(document<{ id: string }>("query B($id: ID!) { item(id: $id) { name } }"), {
      id: "1",
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://wp.test/graphql");
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>).authorization).toBe("Basic secret");

    const body = JSON.parse(init?.body as string);
    expect(body.variables).toEqual({ id: "1" });
    expect(body.query).toContain("__typename");
  });

  it("omits the authorization header when no API key is configured", async () => {
    vi.stubEnv("WORDPRESS_API_KEY", "");
    fetchMock.mockResolvedValue(json({ data: { ok: true } }));

    await execute(document("query C { ok }"));

    expect((fetchMock.mock.calls[0][1]?.headers as Record<string, string>).authorization).toBe(
      undefined,
    );
  });

  it("throws a GraphQLResponseError carrying the status derived from `extensions.code`", async () => {
    fetchMock.mockResolvedValue(
      json({
        data: null,
        errors: [{ message: "Veículo não encontrado", extensions: { code: "NOT_FOUND" } }],
      }),
    );

    const error = await failureOf(execute(document("query D { ok }")));

    expect(GraphQLResponseError.is(error)).toBe(true);
    expect(error.status).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("Veículo não encontrado");
  });

  it("reads the error envelope even when the HTTP status is not 2xx", async () => {
    fetchMock.mockResolvedValue(
      json({ errors: [{ message: "denied", extensions: { code: "FORBIDDEN" } }] }, 403),
    );

    const error = await failureOf(execute(document("query E { ok }")));

    expect(error.status).toBe(403);
  });

  it("flags a partial response (data + errors)", async () => {
    fetchMock.mockResolvedValue(
      json({ data: { ok: true }, errors: [{ message: "one field failed" }] }),
    );

    const error = await failureOf(execute(document("query F { ok }")));

    expect(error.isPartial).toBe(true);
    expect(error.status).toBeUndefined();
  });

  it("throws a plain Error (no status) when the body has no data", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad gateway</html>", { status: 502 }));

    const error = await failureOf(execute(document("query G { ok }")));

    expect(GraphQLResponseError.is(error)).toBe(false);
    expect(error.message).toContain("502");
    expect(error.status).toBeUndefined();
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    await expect(execute(document("query H { ok }"))).rejects.toThrow("fetch failed");
  });

  it("fails clearly when the endpoint is not configured", async () => {
    vi.stubEnv("WORDPRESS_API_URL", "");

    await expect(execute(document("query I { ok }"))).rejects.toThrow(
      "WORDPRESS_API_URL is not set",
    );
  });

  it("never caches on its own: callers decide (use cache in the loaders)", async () => {
    fetchMock.mockResolvedValue(json({ data: { ok: true } }));

    await execute(document("query J { ok }"));

    expect(fetchMock.mock.calls[0][1]?.cache).toBe("no-store");
  });

  it("raises the GraphQL error from a 500 response", async () => {
    fetchMock.mockResolvedValue(json({ errors: [{ message: "resolver failed" }] }, 500));

    const error = await failureOf(execute(document("query L { ok }")));

    expect(GraphQLResponseError.is(error)).toBe(true);
    expect(error.message).toBe("resolver failed");
  });
});
