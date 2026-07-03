import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { EstoqueShell, EstoqueShellFallback } from "./estoque-shell";
import { Suspense } from "react";

/**
 * Hosts the `@filters` parallel-route slot (the sidebar) alongside the default
 * `children` slot (the products list). Living inside the `(list)` route group
 * means this shell wraps only the `/estoque` listing — the `/estoque/[vehicleId]`
 * detail page renders its own layout untouched.
 */
export default function EstoqueListLayout({
  children,
  filters,
}: {
  children: React.ReactNode;
  filters: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <SiteHeader />
      <Suspense fallback={<EstoqueShellFallback />}>
        <EstoqueShell filters={filters}>{children}</EstoqueShell>
      </Suspense>
      <SiteFooter />
    </div>
  );
}
