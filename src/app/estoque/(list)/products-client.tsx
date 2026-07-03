"use client";

import { useInfiniteQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";

import { VirtualizedVehicleList } from "@/app/estoque/_components/virtualized-vehicle-list";
import { graphql, useFragment } from "@/graphql/__gen__";
import { type SearchSort } from "@/hooks/useVehicleFilters";
import { useVehicleMapper } from "@/hooks/useVehicleMapper";

import {
  carsListSearchParams,
  CLEARED_FILTERS,
  countActiveFilters,
  getCarsListInfiniteQueryOptions,
} from "./query";

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

export function ProductsClient() {
  const mapProductToVehicle = useVehicleMapper();
  const [options, setOptions] = useQueryStates(carsListSearchParams);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      ...getCarsListInfiniteQueryOptions(options),
    });

  const allMaskedNodes = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page?.products?.edges?.map((e) => e.node) ?? []),
    [data],
  );

  const totalCount = data?.pages?.[0]?.products?.found ?? undefined;

  const unmaskedNodes = useFragment(Estoque_ProductsFragment, allMaskedNodes);

  const vehicles = useMemo(
    () => unmaskedNodes.map(mapProductToVehicle),
    [unmaskedNodes, mapProductToVehicle],
  );

  const clearFilters = () => setOptions(CLEARED_FILTERS);

  const handleFetchNextPage = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const activeFiltersCount = countActiveFilters(options);

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Carregando..."
            : totalCount != null && totalCount > vehicles.length
              ? `${vehicles.length} de ${totalCount} veículos`
              : `${vehicles.length} ${vehicles.length === 1 ? "veículo encontrado" : "veículos encontrados"}`}
        </p>
        <div className="flex items-center gap-2">
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Ordenar
          </label>
          <select
            value={options.sort}
            onChange={(e) => setOptions({ sort: e.target.value as SearchSort })}
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
      ) : vehicles.length === 0 ? (
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
          vehicles={vehicles}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={handleFetchNextPage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
