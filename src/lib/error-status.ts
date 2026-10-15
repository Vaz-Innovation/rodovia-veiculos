import { tryCatch } from "@/lib/try-catch";

/**
 * The HTTP-like status an error carries, or `undefined` when it carries none.
 *
 * `GraphQLResponseError` (see `@/lib/graphql/error`) derives `status` from the
 * per-error `extensions`, and `ORPCError` exposes it directly, so duck-typing on
 * the property serves both backends. It also keeps working when the error was
 * rebuilt in another module graph, where `instanceof` fails.
 */
export function resolveErrorStatus(error: unknown): number | undefined {
  if (error && typeof error === "object" && "status" in error) {
    const { status } = error as { status: unknown };
    if (typeof status === "number") return status;
  }
  return undefined;
}

/** True when the backend answered "this resource does not exist". */
export function isNotFoundError(error: unknown): boolean {
  return resolveErrorStatus(error) === 404;
}

/**
 * Awaits `promise`, mapping a backend 404 to `null` and rethrowing anything else.
 *
 * Use it **inside** the loader, next to `execute`. A `'use cache'` function does
 * not preserve the error it throws: callers may get the original
 * `GraphQLResponseError` or a rebuilt plain `Error` that kept only `message` and
 * `digest` (Next.js control-flow errors such as `notFound()` survive through the
 * digest, `status` does not). So the 404 check has to run where the error is
 * still intact, and what crosses the cache boundary is plain data: `null` means
 * "doesn't exist" (which also makes it cacheable), a throw means a real failure.
 *
 * `isNotFound` replaces the default 404 check for backends that report a missing
 * resource some other way (see `isMissingProductError`).
 */
export async function nullIfNotFound<T>(
  promise: Promise<T>,
  isNotFound: (error: unknown) => boolean = isNotFoundError,
): Promise<T | null> {
  const [data, error] = await tryCatch(promise);
  if (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
  return data;
}
