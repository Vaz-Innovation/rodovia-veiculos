import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export async function POST(req: NextRequest) {
  // Trim: a secret pasted into a dashboard env field often carries a trailing
  // newline/space, which would silently break every comparison below.
  const secret = process.env.PURGE_SECRET?.trim();
  if (!secret) {
    return Response.json({ ok: false, error: "PURGE_SECRET not set" }, { status: 500 });
  }

  const raw = await req.text();

  const wcSignature = req.headers.get("x-wc-webhook-signature")?.trim();
  const plainSecret = (
    req.headers.get("x-purge-secret") ?? req.nextUrl.searchParams.get("secret")
  )?.trim();

  // Check both paths independently — WooCommerce always sends a signature header,
  // so a query-string `?secret=` must be honored regardless of that header.
  let authorized = false;
  let expected: string | null = null;
  if (plainSecret && safeEqual(plainSecret, secret)) {
    authorized = true;
  }
  if (!authorized && wcSignature) {
    expected = createHmac("sha256", secret).update(raw, "utf8").digest("base64");
    authorized = safeEqual(wcSignature, expected);
  }

  if (!authorized) {
    // TEMPORARY debug — logs no secret material, only shapes and HMAC digests.
    console.warn("[purge] 401", {
      secretLen: secret.length,
      bodyLen: raw.length,
      hasWcSignature: Boolean(wcSignature),
      wcSignature,
      expectedHmac: expected,
      plainSecretLen: plainSecret?.length ?? null,
    });
    return Response.json({ ok: false }, { status: 401 });
  }

  // `expire: 0` forces every `vehicle`-tagged entry stale immediately, so the next
  // request refetches — a full on-demand purge regardless of entry age.
  revalidateTag("vehicle", { expire: 0 });
  return Response.json({ ok: true, revalidated: "vehicle" });
}

/** Constant-time string comparison that tolerates length mismatches. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
