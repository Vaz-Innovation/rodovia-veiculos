"use client";

import type { ReactNode } from "react";

import { ORPCReactProvider } from "@/orpc/query-client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <ORPCReactProvider>
        {children}
        <Toaster />
      </ORPCReactProvider>
    </NuqsAdapter>
  );
}
