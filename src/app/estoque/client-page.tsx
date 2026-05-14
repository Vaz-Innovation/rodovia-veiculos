"use client";

import { FilterGroup } from "./_components/filter-group";
import { NumberInput } from "./_components/number-input";
import { VirtualizedVehicleList } from "./_components/virtualized-vehicle-list";
import { useInfiniteQuery, useQuery, keepPreviousData } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";
import { useQueryStates } from "nuqs";

import { useVehicleMapper } from "@/hooks/useVehicleMapper";

import {
  useVehicleFilters,
  SearchParams,
  SearchSort,
  VehicleFilterApiOptions,
  VehicleFilterOption,
} from "@/hooks/useVehicleFilters";
import {
  getCarsListInfiniteQueryOptions,
  getVehicleFilterOptionsQueryOptions,
  carsListSearchParams,
} from "./query";
import { graphql, useFragment } from "@/graphql/__gen__";

export const Estoque_ProductsFragment = graphql(`
  fragment Estoque_ProductsFragment on Product {
    id
    databaseId
    name
    date
    featured
    productCategories {
      edges {
        node {
          name
        }
      }
    }
    productTags {
      nodes {
        name
      }
    }
    ... on SimpleProduct {
      onSale
      stockStatus
      price
      rawPrice: price(format: RAW)
      regularPrice
      salePrice
      stockStatus
      stockQuantity
      soldIndividually
      attributes {
        nodes {
          name
          options
        }
      }
    }
    image {
      sourceUrl
    }
  }
`);

export function EstoqueClient() {
  const mapProductToVehicle = useVehicleMapper();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [options, setOptions] = useQueryStates(carsListSearchParams);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    ...getCarsListInfiniteQueryOptions(options),
    placeholderData: keepPreviousData,
  });

  const { data: filterOptionsData } = useQuery(getVehicleFilterOptionsQueryOptions());

  const allMaskedNodes = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page?.products?.edges?.map((e) => e.node) ?? []),
    [data],
  );

  const unmaskedNodes = useFragment(Estoque_ProductsFragment, allMaskedNodes);

  const allVehicles = useMemo(
    () => unmaskedNodes.map(mapProductToVehicle),
    [unmaskedNodes, mapProductToVehicle],
  );

  const search = useMemo(
    (): SearchParams => ({
      ...options,
      minPrice: options.minPrice ?? undefined,
      maxPrice: options.maxPrice ?? undefined,
      yearMin: options.yearMin ?? undefined,
      yearMax: options.yearMax ?? undefined,
      kmMax: options.kmMax ?? undefined,
    }),
    [options],
  );

  const apiOptions = useMemo((): VehicleFilterApiOptions | undefined => {
    if (!filterOptionsData) return undefined;
    const toOptions = (
      nodes:
        | Array<{ name?: string | null; slug?: string | null } | null | undefined>
        | null
        | undefined,
    ): VehicleFilterOption[] =>
      (nodes ?? [])
        .map((n) => ({ name: n?.name ?? "", slug: n?.slug ?? "" }))
        .filter((n) => n.name && n.slug)
        .sort((a, b) => a.name.localeCompare(b.name));
    return {
      brands: toOptions(filterOptionsData.productBrands?.nodes),
      categories: toOptions(filterOptionsData.productCategories?.nodes),
      tags: toOptions(filterOptionsData.productTags?.nodes),
    };
  }, [filterOptionsData]);

  const {
    brandOptions,
    modelOptions,
    categoryOptions,
    tagOptions,
    transmissionOptions,
    fuelOptions,
    colorOptions,
    conditionOptions,
    sorted,
  } = useVehicleFilters(allVehicles, search, search.sort, apiOptions);

  const update = (patch: Partial<SearchParams>) => {
    const nuqsPatch = Object.fromEntries(
      Object.entries(patch).map(([k, v]) => [k, v === undefined ? null : v]),
    );
    setOptions(nuqsPatch as Parameters<typeof setOptions>[0]);
  };

  const clearFilters = () =>
    setOptions({
      search: null,
      productBrand: null,
      model: null,
      minPrice: null,
      maxPrice: null,
      yearMin: null,
      yearMax: null,
      kmMax: null,
      transmission: null,
      fuel: null,
      condition: null,
      color: null,
      tagIn: null,
      category: null,
      sort: null,
    });

  const handleFetchNextPage = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const activeFiltersCount =
    (search.productBrand ? 1 : 0) +
    (search.model ? 1 : 0) +
    (search.minPrice || search.maxPrice ? 1 : 0) +
    (search.yearMin || search.yearMax ? 1 : 0) +
    (search.kmMax ? 1 : 0) +
    (search.transmission ? 1 : 0) +
    (search.fuel ? 1 : 0) +
    (search.color ? 1 : 0) +
    (search.condition ? 1 : 0) +
    search.tagIn.length +
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
              value={search.search}
              onChange={(e) => update({ search: e.target.value })}
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
                value={search.productBrand}
                onChange={(e) => update({ productBrand: e.target.value, model: "" })}
                className="w-full bg-card border border-border px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {brandOptions.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
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
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FilterGroup>
            {tagOptions && (
              <FilterGroup label="Tags">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {tagOptions.map((t) => {
                    const checked = search.tagIn.includes(t.slug);
                    return (
                      <label
                        key={t.slug}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground/80"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? search.tagIn.filter((x) => x !== t.slug)
                              : [...search.tagIn, t.slug];
                            update({ tagIn: next });
                          }}
                          className="accent-foreground"
                        />
                        <span>{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              </FilterGroup>
            )}
            <FilterGroup label="Preço">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  placeholder="Mín."
                  value={search.minPrice}
                  onChange={(v: number | undefined) => update({ minPrice: v })}
                />
                <NumberInput
                  placeholder="Máx."
                  value={search.maxPrice}
                  onChange={(v: number | undefined) => update({ maxPrice: v })}
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
                {Object.entries(transmissionOptions).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
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
                {Object.entries(fuelOptions).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
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
                {Object.entries(colorOptions).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </FilterGroup>
            <FilterGroup label="Condição">
              <select
                value={search.condition}
                onChange={(e) => update({ condition: e.target.value })}
                className="w-full bg-card border border-border px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {Object.entries(conditionOptions).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
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
                  onChange={(e) => update({ sort: e.target.value as SearchSort })}
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
