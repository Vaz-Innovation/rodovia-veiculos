import { unstable_rethrow } from 'next/navigation';

type Success<T> = [T, null];
type Failure<E> = [null, E];

export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * tryCatch - Error handling that can be synchronous or asynchronous
 * based on the input function.
 *
 * Next.js signals `redirect()`, `notFound()`, `unauthorized()`, `forbidden()`
 * and dynamic-rendering bailouts by THROWING; they are control flow, not
 * failures. Capturing one into the `Result` swallows the navigation — the
 * caller sees a generic error and renders the wrong page (a session that ended
 * showed up as a 500 instead of the 401 screen). `unstable_rethrow` is the
 * sanctioned way to let those through: it re-throws Next's internal errors and
 * returns for everything else.
 *
 * @param throwable An operation that may throw an error.
 * @returns A Result, or a Promise resolving to a Result, depending on fn.
 */
export function tryCatch<T, E = Error>(fn: () => T): Result<T, E>;
export function tryCatch<T, E = Error>(fn: Promise<T>): Promise<Result<T, E>>;
export function tryCatch<T, E = Error>(
  throwable: (() => T) | Promise<T>,
): Result<T, E> | Promise<Result<T, E>> {
  try {
    if (throwable instanceof Promise) {
      return throwable
        .then((data) => [data, null])
        .catch((error) => {
          unstable_rethrow(error);
          return [null, error];
        }) as Promise<Result<T, E>>;
    } else {
      return [throwable(), null];
    }
  } catch (error) {
    unstable_rethrow(error);
    return [null, error as E];
  }
}
