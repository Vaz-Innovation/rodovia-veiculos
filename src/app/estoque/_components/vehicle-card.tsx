import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  vehicleTitle,
  formatMileage,
  formatPrice,
  TRANSMISSION_LABELS,
  VehicleWithPhoto,
} from "@/lib/vehicles";

export function VehicleCard({ vehicle }: { vehicle: VehicleWithPhoto }) {
  const cover =
    vehicle.vehicle_photos.find((p) => p.is_cover) ??
    [...vehicle.vehicle_photos].sort((a, b) => a.position - b.position)[0];

  return (
    <Link
      href={`/estoque/${vehicle.id}`}
      className="group block bg-card border border-border hover:border-foreground/30 transition-colors"
    >
      <div className="aspect-4/3 overflow-hidden bg-muted relative">
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
        <span className="font-medium text-lg">{vehicle.name}</span>
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
