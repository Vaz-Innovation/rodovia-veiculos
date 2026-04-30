const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;
const WORDPRESS_API_KEY = process.env.WORDPRESS_API_KEY;

function getHeaders(req: Request): HeadersInit {
  const headers: Record<string, string> = {
    Authorization: `Basic ${WORDPRESS_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json", // safer than graphql-response+json
  };

  const accept = req.headers.get("accept");
  if (accept) headers.Accept = accept;

  return headers;
}

export async function POST(req: Request) {
  if (!WORDPRESS_API_URL || !WORDPRESS_API_KEY) {
    return Response.json(
      { error: "Missing WORDPRESS_API_URL or WORDPRESS_API_KEY" },
      { status: 500 },
    );
  }

  try {
    const body = await req.text();

    const response = await fetch(WORDPRESS_API_URL, {
      method: "POST",
      headers: getHeaders(req),
      body,
    });

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    if (!response.ok) {
      console.error("Proxy error:", text);
      return Response.json(
        {
          error: response.statusText,
          status: response.status,
          body: text,
        },
        { status: response.status },
      );
    }

    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": contentType || "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy exception:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unexpected proxy error",
      },
      { status: 500 },
    );
  }
}
