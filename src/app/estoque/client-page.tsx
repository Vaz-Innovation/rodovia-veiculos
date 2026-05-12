"use client";

import { FilterGroup } from "./_components/filter-group";
import { NumberInput } from "./_components/number-input";
import { VirtualizedVehicleList } from "./_components/virtualized-vehicle-list";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  COMMON_COLORS,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  type VehicleWithPhoto,
} from "@/lib/vehicles";
import { cn } from "@/lib/utils";
import { execute } from "@/graphql/execute";

import { CarsListPaginatedQuery } from "./query";
import { useVehicleMapper } from "@/hooks/useVehicleMapper";

import {
  buildWhereArgs,
  useVehicleFilters,
  SearchParams,
  SearchSort,
  SORT_OPTIONS,
} from "@/hooks/useVehicleFilters";

const PAGE_SIZE = 24;

const DEFAULT_SEARCH: SearchParams = {
  q: "",
  brand: "",
  model: "",
  priceMin: undefined,
  priceMax: undefined,
  yearMin: undefined,
  yearMax: undefined,
  kmMax: undefined,
  transmission: "",
  fuel: "",
  color: "",
  tags: [],
  category: "",
  sort: "recent",
};

const toNumber = (value: string | null) => {
  if (value == null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

function parseSearchParams(params: URLSearchParams): SearchParams {
  const sortRaw = params.get("sort") ?? "recent";
  const sort = SORT_OPTIONS.includes(sortRaw as SearchSort) ? (sortRaw as SearchSort) : "recent";

  return {
    ...DEFAULT_SEARCH,
    q: params.get("q") ?? "",
    brand: params.get("brand") ?? "",
    model: params.get("model") ?? "",
    priceMin: toNumber(params.get("priceMin")),
    priceMax: toNumber(params.get("priceMax")),
    yearMin: toNumber(params.get("yearMin")),
    yearMax: toNumber(params.get("yearMax")),
    kmMax: toNumber(params.get("kmMax")),
    transmission: params.get("transmission") ?? "",
    fuel: params.get("fuel") ?? "",
    color: params.get("color") ?? "",
    tags: params.getAll("tags").filter(Boolean),
    category: params.get("category") ?? "",
    sort,
  };
}

function buildQueryString(next: SearchParams): string {
  const params = new URLSearchParams();

  const set = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === "") return;
    params.set(key, String(value));
  };

  set("q", next.q);
  set("brand", next.brand);
  set("model", next.model);
  set("priceMin", next.priceMin);
  set("priceMax", next.priceMax);
  set("yearMin", next.yearMin);
  set("yearMax", next.yearMax);
  set("kmMax", next.kmMax);
  set("transmission", next.transmission);
  set("fuel", next.fuel);
  set("color", next.color);
  set("category", next.category);

  for (const tag of next.tags) params.append("tags", tag);

  if (next.sort !== DEFAULT_SEARCH.sort) set("sort", next.sort);

  return params.toString();
}

export function EstoqueClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapProductToVehicle = useVehicleMapper();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = useMemo(
    () => parseSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  // Infinite query com paginação GraphQL
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [
      "vehicles-infinite",
      search.q,
      search.brand,
      search.category,
      search.priceMin,
      search.priceMax,
      search.sort,
    ],
    queryFn: async ({ pageParam }) => {
      const where = buildWhereArgs(search);
      const result = await execute(CarsListPaginatedQuery, {
        first: PAGE_SIZE,
        after: pageParam ?? null,
        where,
      });
      return result;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const pageInfo = lastPage?.products?.pageInfo;
      if (pageInfo?.hasNextPage && pageInfo?.endCursor) {
        return pageInfo.endCursor;
      }
      return undefined;
    },
  });

  // Flatten all pages into a single array of vehicles
  const allVehicles: VehicleWithPhoto[] = useMemo(() => {
    if (!data?.pages) return [];

    return data.pages.flatMap((page) => {
      const edges = page?.products?.edges ?? [];
      return edges.map((e) => mapProductToVehicle(e.node));
    });
  }, [data, mapProductToVehicle]);

  const { brandOptions, modelOptions, categoryOptions, tagOptions, sorted } = useVehicleFilters(
    allVehicles,
    search,
    search.sort,
  );

  const replaceSearch = (next: SearchParams) => {
    const qs = buildQueryString(next);
    router.replace(qs ? `/estoque?${qs}` : "/estoque");
  };

  const update = (patch: Partial<SearchParams>) => {
    replaceSearch({
      ...search,
      ...patch,
    });
  };

  const clearFilters = () => replaceSearch(DEFAULT_SEARCH);

  const handleFetchNextPage = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const activeFiltersCount =
    (search.brand ? 1 : 0) +
    (search.model ? 1 : 0) +
    (search.priceMin || search.priceMax ? 1 : 0) +
    (search.yearMin || search.yearMax ? 1 : 0) +
    (search.kmMax ? 1 : 0) +
    (search.transmission ? 1 : 0) +
    (search.fuel ? 1 : 0) +
    (search.color ? 1 : 0) +
    search.tags.length +
    (search.category ? 1 : 0);

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <SiteHeader />

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
              value={search.q}
              onChange={(e) => update({ q: e.target.value })}
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Filtros</h2>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  Limpar <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <FilterGroup label="Marca">
              <select
                value={search.brand}
                onChange={(e) => update({ brand: e.target.value, model: "" })}
                className="w-full bg-card border border-border px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {brandOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="Modelo">
              <select
                value={search.model}
                onChange={(e) => update({ model: e.target.value })}
                className="w-full bg-card border border-border px-3 py-2 text-sm"
                disabled={!modelOptions.length}
              >
                <option value="">Todos</option>
                {modelOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="Categoria">
              <select
                value={search.category}
                onChange={(e) => update({ category: e.target.value })}
                className="w-full bg-card border border-border px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="Tags">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {tagOptions.map((t) => {
                  const checked = search.tags.includes(t);
                  return (
                    <label
                      key={t}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground/80"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? search.tags.filter((x) => x !== t)
                            : [...search.tags, t];
                          update({ tags: next });
                        }}
                        className="accent-foreground"
                      />
                      <span>{t}</span>
                    </label>
                  );
                })}
              </div>
            </FilterGroup>

            <FilterGroup label="Preço">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  placeholder="Mín."
                  value={search.priceMin}
                  onChange={(v: number | undefined) => update({ priceMin: v })}
                />
                <NumberInput
                  placeholder="Máx."
                  value={search.priceMax}
                  onChange={(v: number | undefined) => update({ priceMax: v })}
                />
              </div>
            </FilterGroup>

            <FilterGroup label="Ano">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  placeholder="De"
                  value={search.yearMin}
                  onChange={(v: number | undefined) => update({ yearMin: v })}
                />
                <NumberInput
                  placeholder="Até"
                  value={search.yearMax}
                  onChange={(v: number | undefined) => update({ yearMax: v })}
                />
              </div>
            </FilterGroup>

            <FilterGroup label="Km máxima">
              <NumberInput
                placeholder="Ex.: 80000"
                value={search.kmMax}
                onChange={(v: number | undefined) => update({ kmMax: v })}
              />
            </FilterGroup>

            <FilterGroup label="Câmbio">
              <select
                value={search.transmission}
                onChange={(e) => update({ transmission: e.target.value })}
                className="w-full bg-card border border-border px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {Object.entries(TRANSMISSION_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="Combustível">
              <select
                value={search.fuel}
                onChange={(e) => update({ fuel: e.target.value })}
                className="w-full bg-card border border-border px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {Object.entries(FUEL_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="Cor">
              <select
                value={search.color}
                onChange={(e) => update({ color: e.target.value })}
                className="w-full bg-card border border-border px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {COMMON_COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FilterGroup>
          </aside>

          <div className="flex flex-col min-h-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Carregando..."
                  : `${sorted.length} ${sorted.length === 1 ? "veículo encontrado" : "veículos encontrados"}`}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Ordenar
                </label>
                <select
                  value={search.sort}
                  onChange={(e) => update({ sort: e.target.value as SearchParams["sort"] })}
                  className="bg-card border border-border px-3 py-2 text-sm"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="price_asc">Menor preço</option>
                  <option value="price_desc">Maior preço</option>
                  <option value="year_desc">Mais novos</option>
                  <option value="km_asc">Menor km</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card aspect-4/3 animate-pulse" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="bg-card border border-border p-12 text-center">
                <p className="text-muted-foreground">
                  Nenhum veículo encontrado com os filtros aplicados.
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] hover:text-muted-foreground"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <VirtualizedVehicleList
                vehicles={sorted}
                hasNextPage={hasNextPage ?? false}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={handleFetchNextPage}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
