import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export async function POST(req: NextRequest) {
  const secret = process.env.PURGE_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "PURGE_SECRET not set" }, { status: 500 });
  }

  const rawBody = Buffer.from(await req.arrayBuffer());

  const wcSignature = req.headers.get("x-wc-webhook-signature");
  const plainSecret = req.headers.get("x-purge-secret") ?? req.nextUrl.searchParams.get("secret");

  let authorized = false;
  if (plainSecret && safeEqual(plainSecret, secret)) {
    authorized = true;
  }
  if (!authorized && wcSignature) {
    const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
    authorized = safeEqual(wcSignature, expected);
  }

  if (!authorized) {
    return Response.json({ ok: false }, { status: 401 });
  }

  revalidateTag("vehicle", { expire: 0 });
  return Response.json({ ok: true, revalidated: "vehicle" });
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
