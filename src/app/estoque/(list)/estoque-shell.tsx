"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQueryStates } from "nuqs";

import { cn } from "@/lib/utils";
import { carsListSearchParams, countActiveFilters } from "./query";

/**
 * Interactive chrome shared by both parallel-route slots. It owns the mobile
 * filters toggle and the search box, wrapping the server-rendered `filters`
 * (aside) and `children` (products) slots. Cross-slot filter state is shared
 * through the URL via nuqs, so the two slots stay in sync without lifting state.
 */
export function EstoqueShell({
  filters,
  children,
}: {
  filters: React.ReactNode;
  children: React.ReactNode;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [options, setOptions] = useQueryStates(carsListSearchParams);
  const activeFiltersCount = countActiveFilters(options);

  return (
    <>
      <section className="pt-32 pb-8 mx-auto max-w-400 w-full px-6 lg:px-10">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">
          Estoque atual
        </p>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight">Estoque</h1>

        <div className="mt-8 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar por marca, modelo ou versão..."
              value={options.search}
              onChange={(e) => setOptions({ search: e.target.value })}
              className="w-full bg-card border border-border pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </div>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="md:hidden inline-flex items-center justify-center gap-2 border border-border bg-card px-6 py-4 text-xs uppercase tracking-[0.2em]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-foreground text-background text-[10px] px-1.5 py-0.5">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </section>

      <section className="flex-1 mx-auto max-w-400 w-full px-6 lg:px-10 pb-24">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside
            className={cn(
              "lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto",
              filtersOpen ? "block" : "hidden lg:block",
            )}
          >
            {filters}
          </aside>
          {children}
        </div>
      </section>
    </>
  );
}

/** Static fallback rendered while the dynamic (searchParams-driven) shell streams. */
export function EstoqueShellFallback() {
  return (
    <>
      <section className="pt-32 pb-8 mx-auto max-w-400 w-full px-6 lg:px-10">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">
          Estoque atual
        </p>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight">Estoque</h1>
        <div className="mt-8 h-14 w-full bg-card animate-pulse" />
      </section>
      <section className="flex-1 mx-auto max-w-400 w-full px-6 lg:px-10 pb-24">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <div className="hidden lg:block space-y-6" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-full bg-card animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card aspect-4/3 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
