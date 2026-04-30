"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import {
  COMMON_COLORS,
  COMMON_FEATURES,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  formatMileage,
  formatPrice,
  vehicleTitle,
  type FuelType,
  type TransmissionType,
  type Vehicle,
  type VehiclePhoto,
} from "@/lib/vehicles";
import { cn } from "@/lib/utils";
import { gqlQueryOptions } from "@/graphql/gqlpc";
import { CarsListQuery } from "@/graphql/pages/estoque";

const PAGE_SIZE = 12;
const SORT_OPTIONS = ["recent", "price_asc", "price_desc", "year_desc", "km_asc"] as const;

type SearchSort = (typeof SORT_OPTIONS)[number];

type SearchParams = {
  q: string;
  brand: string;
  model: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  kmMax?: number;
  transmission: string;
  fuel: string;
  color: string;
  features: string[];
  sort: SearchSort;
  page: number;
};

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
  features: [],
  sort: "recent",
  page: 1,
};

const toNumber = (value: string | null) => {
  if (value == null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

function parseSearchParams(params: URLSearchParams): SearchParams {
  const sortRaw = params.get("sort") ?? "recent";
  const sort = SORT_OPTIONS.includes(sortRaw as SearchSort) ? (sortRaw as SearchSort) : "recent";
  const page = Math.max(1, Math.floor(toNumber(params.get("page")) ?? 1));

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
    features: params.getAll("features").filter(Boolean),
    sort,
    page,
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

  for (const feature of next.features) params.append("features", feature);

  if (next.sort !== DEFAULT_SEARCH.sort) set("sort", next.sort);
  if (next.page !== DEFAULT_SEARCH.page) set("page", next.page);

  return params.toString();
}

type VehicleWithPhoto = Vehicle & { vehicle_photos: VehiclePhoto[] };

export function EstoqueClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = useMemo(
    () => parseSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const { data } = useQuery(gqlQueryOptions(CarsListQuery));

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles", "list"],
    queryFn: async (): Promise<VehicleWithPhoto[]> => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, vehicle_photos(*)")
        .eq("status", "disponivel")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VehicleWithPhoto[];
    },
  });

  const all = vehicles ?? [];

  const brandOptions = useMemo(() => Array.from(new Set(all.map((v) => v.brand))).sort(), [all]);
  const modelOptions = useMemo(() => {
    return Array.from(
      new Set(all.filter((v) => !search.brand || v.brand === search.brand).map((v) => v.model)),
    ).sort();
  }, [all, search.brand]);

  const filtered = useMemo(() => filterVehicles(all, search), [all, search]);
  const sorted = useMemo(() => sortVehicles(filtered, search.sort), [filtered, search.sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(search.page, totalPages);
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const replaceSearch = (next: SearchParams) => {
    const qs = buildQueryString(next);
    router.replace(qs ? `/estoque?${qs}` : "/estoque");
  };

  const update = (patch: Partial<SearchParams>) => {
    replaceSearch({
      ...search,
      ...patch,
      page: patch.page ?? 1,
    });
  };

  const clearFilters = () => replaceSearch(DEFAULT_SEARCH);

  const activeFiltersCount =
    (search.brand ? 1 : 0) +
    (search.model ? 1 : 0) +
    (search.priceMin || search.priceMax ? 1 : 0) +
    (search.yearMin || search.yearMax ? 1 : 0) +
    (search.kmMax ? 1 : 0) +
    (search.transmission ? 1 : 0) +
    (search.fuel ? 1 : 0) +
    (search.color ? 1 : 0) +
    search.features.length;

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <SiteHeader />

      <section className="pt-32 pb-8 mx-auto max-w-400 w-full px-6 lg:px-10">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">
          Estoque atual
        </p>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight">
          Encontre seu próximo carro
        </h1>

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

      <section className="flex-1 mx-auto max-w-[1600px] w-full px-6 lg:px-10 pb-24">
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

            <FilterGroup label="Preço">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  placeholder="Mín."
                  value={search.priceMin}
                  onChange={(v) => update({ priceMin: v })}
                />
                <NumberInput
                  placeholder="Máx."
                  value={search.priceMax}
                  onChange={(v) => update({ priceMax: v })}
                />
              </div>
            </FilterGroup>

            <FilterGroup label="Ano">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  placeholder="De"
                  value={search.yearMin}
                  onChange={(v) => update({ yearMin: v })}
                />
                <NumberInput
                  placeholder="Até"
                  value={search.yearMax}
                  onChange={(v) => update({ yearMax: v })}
                />
              </div>
            </FilterGroup>

            <FilterGroup label="Km máxima">
              <NumberInput
                placeholder="Ex.: 80000"
                value={search.kmMax}
                onChange={(v) => update({ kmMax: v })}
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

            <FilterGroup label="Opcionais">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {COMMON_FEATURES.map((f) => {
                  const checked = search.features.includes(f);
                  return (
                    <label
                      key={f}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground/80"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? search.features.filter((x) => x !== f)
                            : [...search.features, f];
                          update({ features: next });
                        }}
                        className="accent-foreground"
                      />
                      <span>{f}</span>
                    </label>
                  );
                })}
              </div>
            </FilterGroup>
          </aside>

          <div>
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
                  <div key={i} className="bg-card aspect-[4/3] animate-pulse" />
                ))}
              </div>
            ) : pageItems.length === 0 ? (
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pageItems.map((v) => (
                    <VehicleCard key={v.id} vehicle={v} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPage={(p) => update({ page: p })}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pb-6 border-b border-border last:border-0">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">{label}</p>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : Number(v));
      }}
      className="w-full bg-card border border-border px-3 py-2 text-sm"
    />
  );
}

function VehicleCard({ vehicle }: { vehicle: VehicleWithPhoto }) {
  const cover =
    vehicle.vehicle_photos.find((p) => p.is_cover) ??
    [...vehicle.vehicle_photos].sort((a, b) => a.position - b.position)[0];

  return (
    <Link
      href={`/estoque/${vehicle.id}`}
      className="group block bg-card border border-border hover:border-foreground/30 transition-colors"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        {cover ? (
          <img
            src={cover.url}
            alt={vehicleTitle(vehicle)}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs uppercase tracking-[0.2em]">
            Sem foto
          </div>
        )}
        {vehicle.featured && (
          <span className="absolute top-3 left-3 bg-foreground text-background text-[10px] uppercase tracking-[0.2em] px-2 py-1">
            Destaque
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {vehicle.brand}
        </p>
        <h3 className="mt-1 text-lg font-light leading-tight">
          {vehicle.model}
          {vehicle.version && (
            <span className="text-muted-foreground text-sm"> {vehicle.version}</span>
          )}
        </h3>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{vehicle.year_model}</span>
          <span>·</span>
          <span>{formatMileage(vehicle.mileage)}</span>
          <span>·</span>
          <span>{TRANSMISSION_LABELS[vehicle.transmission]}</span>
        </div>
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
          <p className="text-xl font-light">{formatPrice(Number(vehicle.price))}</p>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 border border-border text-xs uppercase tracking-[0.2em] disabled:opacity-30 hover:bg-card"
      >
        Anterior
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={cn(
              "min-w-10 h-10 text-sm border border-border",
              p === page ? "bg-foreground text-background" : "hover:bg-card",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 border border-border text-xs uppercase tracking-[0.2em] disabled:opacity-30 hover:bg-card"
      >
        Próxima
      </button>
    </div>
  );
}

function filterVehicles(list: VehicleWithPhoto[], s: SearchParams): VehicleWithPhoto[] {
  const q = s.q.trim().toLowerCase();
  return list.filter((v) => {
    if (q) {
      const text = `${v.brand} ${v.model} ${v.version ?? ""}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    if (s.brand && v.brand !== s.brand) return false;
    if (s.model && v.model !== s.model) return false;
    const price = Number(v.price);
    if (s.priceMin !== undefined && price < s.priceMin) return false;
    if (s.priceMax !== undefined && price > s.priceMax) return false;
    if (s.yearMin !== undefined && v.year_model < s.yearMin) return false;
    if (s.yearMax !== undefined && v.year_model > s.yearMax) return false;
    if (s.kmMax !== undefined && v.mileage > s.kmMax) return false;
    if (s.transmission && v.transmission !== (s.transmission as TransmissionType)) return false;
    if (s.fuel && v.fuel !== (s.fuel as FuelType)) return false;
    if (s.color && v.color.toLowerCase() !== s.color.toLowerCase()) return false;
    if (s.features.length > 0) {
      const has = s.features.every((f) =>
        v.features.some((vf) => vf.toLowerCase() === f.toLowerCase()),
      );
      if (!has) return false;
    }
    return true;
  });
}

function sortVehicles(list: VehicleWithPhoto[], sort: SearchParams["sort"]): VehicleWithPhoto[] {
  const copy = [...list];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => Number(a.price) - Number(b.price));
    case "price_desc":
      return copy.sort((a, b) => Number(b.price) - Number(a.price));
    case "year_desc":
      return copy.sort((a, b) => b.year_model - a.year_model);
    case "km_asc":
      return copy.sort((a, b) => a.mileage - b.mileage);
    default:
      return copy.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
}
