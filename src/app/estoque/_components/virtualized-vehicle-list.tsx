"use client";

import { useRef, useCallback, useEffect, useMemo, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2 } from "lucide-react";

import { VehicleCard } from "./vehicle-card";
import { VehicleWithPhoto } from "@/lib/vehicles";

interface VirtualizedVehicleListProps {
  vehicles: VehicleWithPhoto[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isLoading?: boolean;
}

// Número de colunas baseado no breakpoint
function useColumns() {
  const getColumns = useCallback(() => {
    if (typeof window === "undefined") return 3;
    const width = window.innerWidth;
    if (width < 640) return 1; // sm
    if (width < 1280) return 2; // xl
    return 3;
  }, []);

  const [columns, setColumns] = useState(getColumns);

  useEffect(() => {
    const handleResize = () => {
      setColumns(getColumns());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getColumns]);

  return columns;
}

export function VirtualizedVehicleList({
  vehicles,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
}: VirtualizedVehicleListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const columns = useColumns();

  // Agrupa os veículos em linhas baseado no número de colunas
  const rows = useMemo(() => {
    const result: VehicleWithPhoto[][] = [];
    for (let i = 0; i < vehicles.length; i += columns) {
      result.push(vehicles.slice(i, i + columns));
    }
    return result;
  }, [vehicles, columns]);

  const virtualizer = useVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 420, // Altura estimada de cada linha (card + gap)
    overscan: 3,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Infinite scroll trigger
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      lastItem.index >= rows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage, rows.length]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card aspect-[4/3] animate-pulse" />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return null;
  }

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-300px)] overflow-auto"
      style={{ contain: "strict" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const isLoaderRow = virtualRow.index > rows.length - 1;
          const row = rows[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLoaderRow ? (
                <div className="flex items-center justify-center h-full">
                  {hasNextPage && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Carregando mais veículos...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                  {row?.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
