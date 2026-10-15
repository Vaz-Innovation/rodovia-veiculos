const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;
const WORDPRESS_API_KEY = process.env.WORDPRESS_API_KEY;

function getHeaders(req: Request): HeadersInit {
  return {
    Authorization: `Basic ${WORDPRESS_API_KEY}`,
    "Content-Type": "application/json",
    Accept: req.headers.get("accept") || "application/json",
  };
}

/**
 * Browser → WordPress GraphQL proxy, so the API key never leaves the server.
 * The upstream status and body are passed through untouched: a GraphQL error
 * envelope (`{ errors }`, possibly with a 4xx/5xx status) must reach the client
 * as-is so `execute` can raise a `GraphQLResponseError` with the right status.
 */
export async function POST(req: Request) {
  if (!WORDPRESS_API_URL || !WORDPRESS_API_KEY) {
    return Response.json(
      { errors: [{ message: "Missing WORDPRESS_API_URL or WORDPRESS_API_KEY" }] },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(WORDPRESS_API_URL, {
      method: "POST",
      headers: getHeaders(req),
      body: await req.text(),
      cache: "no-store",
    });

    const text = await response.text();
    if (!response.ok) {
      console.error(`[graphql proxy] upstream answered ${response.status}`);
    }

    return new Response(text, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    console.error("[graphql proxy] request failed", error);
    return Response.json(
      { errors: [{ message: error instanceof Error ? error.message : "Unexpected proxy error" }] },
      { status: 502 },
    );
  }
}
