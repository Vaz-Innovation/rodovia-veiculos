"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";

import { FilterGroup } from "@/app/estoque/_components/filter-group";
import { NumberInput } from "@/app/estoque/_components/number-input";
import { useVehicleFilters, type SearchParams } from "@/hooks/useVehicleFilters";

import { carsListSearchParams, CLEARED_FILTERS, countActiveFilters } from "../query";
import { getVehicleFilterOptionsQueryOptions, mapFilterOptions } from "./query";

export function FiltersClient() {
  const [options, setOptions] = useQueryStates(carsListSearchParams);

  const { data } = useQuery(getVehicleFilterOptionsQueryOptions());
  const apiOptions = mapFilterOptions(data);

  const {
    brandOptions,
    modelOptions,
    categoryOptions,
    tagOptions,
    transmissionOptions,
    fuelOptions,
    colorOptions,
    conditionOptions,
  } = useVehicleFilters(apiOptions);

  const update = (patch: Partial<SearchParams>) => {
    const nuqsPatch = Object.fromEntries(
      Object.entries(patch).map(([k, v]) => [k, v === undefined ? null : v]),
    );
    setOptions(nuqsPatch as Parameters<typeof setOptions>[0]);
  };

  const clearFilters = () => setOptions(CLEARED_FILTERS);

  const activeFiltersCount = countActiveFilters(options);

  return (
    <>
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
          value={options.brand}
          onChange={(e) => update({ brand: e.target.value, model: "" })}
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
          value={options.model}
          onChange={(e) => update({ model: e.target.value })}
          className="w-full bg-card border border-border px-3 py-2 text-sm"
          disabled={!modelOptions.length}
        >
          <option value="">Todos</option>
          {modelOptions.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </select>
      </FilterGroup>
      <FilterGroup label="Categoria">
        <select
          value={options.category}
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
      {tagOptions.length > 0 && (
        <FilterGroup label="Tags">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {tagOptions.map((t) => {
              const id = String(t.id);
              const checked = options.tagIn.includes(id);
              return (
                <label
                  key={t.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground/80"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? options.tagIn.filter((x) => x !== id)
                        : [...options.tagIn, id];
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
            currency
            value={options.minPrice ?? undefined}
            onChange={(v: number | undefined) => update({ minPrice: v })}
          />
          <NumberInput
            placeholder="Máx."
            currency
            value={options.maxPrice ?? undefined}
            onChange={(v: number | undefined) => update({ maxPrice: v })}
          />
        </div>
      </FilterGroup>
      <FilterGroup label="Ano">
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            placeholder="De"
            value={options.yearMin ?? undefined}
            onChange={(v: number | undefined) => update({ yearMin: v })}
          />
          <NumberInput
            placeholder="Até"
            value={options.yearMax ?? undefined}
            onChange={(v: number | undefined) => update({ yearMax: v })}
          />
        </div>
      </FilterGroup>
      <FilterGroup label="Km máxima">
        <NumberInput
          placeholder="Ex.: 80000"
          value={options.kmMax ?? undefined}
          onChange={(v: number | undefined) => update({ kmMax: v })}
        />
      </FilterGroup>
      <FilterGroup label="Câmbio">
        <select
          value={options.transmission}
          onChange={(e) => update({ transmission: e.target.value })}
          className="w-full bg-card border border-border px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          {transmissionOptions.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
      </FilterGroup>
      <FilterGroup label="Combustível">
        <select
          value={options.fuel}
          onChange={(e) => update({ fuel: e.target.value })}
          className="w-full bg-card border border-border px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          {fuelOptions.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
      </FilterGroup>
      <FilterGroup label="Cor">
        <select
          value={options.color}
          onChange={(e) => update({ color: e.target.value })}
          className="w-full bg-card border border-border px-3 py-2 text-sm"
        >
          <option value="">Todas</option>
          {colorOptions.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
      </FilterGroup>
      <FilterGroup label="Condição">
        <select
          value={options.condition}
          onChange={(e) => update({ condition: e.target.value })}
          className="w-full bg-card border border-border px-3 py-2 text-sm"
        >
          <option value="">Todas</option>
          {conditionOptions.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
      </FilterGroup>
    </>
  );
}
