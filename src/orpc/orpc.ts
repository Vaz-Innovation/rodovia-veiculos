import type { ClientRetryPluginContext } from "@orpc/client/plugins";
import type { ContractRouterClient } from "@orpc/contract";
import { authClient } from "@/auth/client";
import { getBaseUrl } from "@/lib/base-url";
import { logger } from "@/lib/logger";
import { createORPCClient, onError, onStart, onSuccess, ORPCError } from "@orpc/client";
import { ValidationError } from "@orpc/contract";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createRouterUtils } from "@orpc/tanstack-query";
import z from "zod";

// <-- zod v4
import { apiContract } from "@acme/api";

import { orpcPlugins } from "./orpc.shared";

// Extend the client context to include retry plugin
type ORPCClientContext = ClientRetryPluginContext;

/**
 * This is part of the Optimize SSR setup.
 *
 * @see {@link https://orpc.unnoq.com/docs/adapters/next#optimize-ssr}
 */
declare global {
  var $client: ContractRouterClient<typeof apiContract> | undefined;
}

const link = new OpenAPILink<ORPCClientContext>(apiContract, {
  url: getBaseUrl() + "/api/orpc",
  fetch: (input, init) => fetch(input, { ...init, credentials: "include" }),
  async headers(options, path, input) {
    const headers = new Headers();
    headers.set("x-client", "Web Client");
    const { data: org } = await authClient.organization.getFullOrganization();
    if (org) {
      headers.set("x-tenant", org.slug);
    }
    return headers;
  },
  interceptors: [
    onStart((data) => {
      logger.debug(
        {
          data,
        },
        `oRPC Request started: ${data.path.join(".")}`,
      );
    }),
    onSuccess((response, e) => {
      logger.debug(
        {
          data: response,
        },
        `oRPC response: ${e.path.join(".")}`,
      );
    }),
    onError((error, ctx) => {
      // Ignore aborted requests (React Query / navigation cancellations)
      if (
        error instanceof Error &&
        (error.name === "AbortError" ||
          (error as any).code === "ABORT_ERR" ||
          (error as any).cause?.name === "AbortError")
      ) {
        logger.debug(
          {
            error,
          },
          `oRPC request aborted: ${ctx.path.join(".")}`,
        );
        return;
      }

      // Map oRPC BAD_REQUEST validation errors to 422 UNPROCESSABLE_CONTENT with Zod flattened data
      if (error instanceof ValidationError) {
        const zodError = new z.ZodError(error.issues as z.core.$ZodIssue[]);
        const message = z.prettifyError(zodError);
        const data = z.flattenError(zodError);
        throw new ORPCError("UNPROCESSABLE_CONTENT", {
          status: 422,
          message,
          data,
          cause: error.cause,
        });
      }
      logger.error(
        {
          error,
        },
        `Unhandled error: ${ctx.path.join(".")} :${(error as Error).message}`,
      );
    }),
  ],
  plugins: orpcPlugins,
});

export const client: ContractRouterClient<typeof apiContract, ORPCClientContext> =
  globalThis.$client ?? createORPCClient(link);

export const orpc = createRouterUtils(client);
