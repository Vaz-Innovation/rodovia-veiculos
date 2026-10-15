"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { getQueryClient } from "@/lib/query-client";

export function QueryProvider({ children }: { children: ReactNode }) {
  // Not `useState`: if this suspends before mounting, React would throw the
  // client away. `getQueryClient` is a singleton in the browser.
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
