"use client";

import type { ReactNode } from "react";

import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <QueryProvider>
        {children}
        <Toaster />
      </QueryProvider>
    </NuqsAdapter>
  );
}
