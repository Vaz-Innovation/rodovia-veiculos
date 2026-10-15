import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn<typeof fetch>();

async function loadRoute() {
  vi.resetModules();
  return import("./route");
}

const request = (body = '{"query":"{ ok }"}') =>
  new Request("http://localhost/api/wordpress/graphql", {
    method: "POST",
    headers: { accept: "application/graphql-response+json" },
    body,
  });

describe("POST /api/wordpress/graphql", () => {
  beforeEach(() => {
    vi.stubEnv("WORDPRESS_API_URL", "https://wp.test/graphql");
    vi.stubEnv("WORDPRESS_API_KEY", "secret");
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("forwards the request with the API key and the client's accept header", async () => {
    fetchMock.mockResolvedValue(new Response('{"data":{"ok":true}}', { status: 200 }));
    const { POST } = await loadRoute();

    await POST(request());

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://wp.test/graphql");
    expect(init?.body).toBe('{"query":"{ ok }"}');
    expect(init?.headers).toMatchObject({
      Authorization: "Basic secret",
      Accept: "application/graphql-response+json",
    });
  });

  it("passes an error envelope through with the upstream status", async () => {
    const envelope = '{"errors":[{"message":"resolver failed"}],"data":null}';
    fetchMock.mockResolvedValue(
      new Response(envelope, { status: 500, headers: { "content-type": "application/json" } }),
    );
    const { POST } = await loadRoute();

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(await response.text()).toBe(envelope);
  });

  it("answers 502 with an errors envelope when WordPress is unreachable", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const { POST } = await loadRoute();

    const response = await POST(request());

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ errors: [{ message: "fetch failed" }] });
  });
});
