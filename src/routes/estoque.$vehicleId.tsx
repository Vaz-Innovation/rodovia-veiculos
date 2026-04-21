import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import {
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  formatMileage,
  formatPrice,
  vehicleTitle,
  whatsappLink,
  type Vehicle,
  type VehiclePhoto,
} from "@/lib/vehicles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estoque/$vehicleId")({
  component: VehicleDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-light">Veículo não encontrado</h1>
        <Link
          to="/estoque"
          className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] hover:text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao estoque
        </Link>
      </div>
    </div>
  ),
});

type VehicleWithPhotos = Vehicle & { vehicle_photos: VehiclePhoto[] };

function VehicleDetailPage() {
  const { vehicleId } = Route.useParams();
  const [photoIndex, setPhotoIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: async (): Promise<VehicleWithPhotos | null> => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, vehicle_photos(*)")
        .eq("id", vehicleId)
        .maybeSingle();
      if (error) throw error;
      return data as VehicleWithPhotos | null;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <SiteHeader />
        <div className="pt-32 mx-auto max-w-[1600px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="aspect-[4/3] bg-card animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-card animate-pulse w-2/3" />
              <div className="h-4 bg-card animate-pulse w-1/2" />
              <div className="h-12 bg-card animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    throw notFound();
  }

  const photos = [...data.vehicle_photos].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position,
  );
  const current = photos[photoIndex];

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <SiteHeader />

      <section className="pt-28 pb-8 mx-auto max-w-[1600px] w-full px-6 lg:px-10">
        <Link
          to="/estoque"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao estoque
        </Link>
      </section>

      <section className="mx-auto max-w-[1600px] w-full px-6 lg:px-10 pb-16 grid lg:grid-cols-[1.4fr_1fr] gap-10">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/3] bg-card overflow-hidden">
            {current ? (
              <>
                <img
                  src={current.url}
                  alt={vehicleTitle(data)}
                  className="h-full w-full object-cover"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 hover:bg-background"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 hover:bg-background"
                      aria-label="Próxima foto"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <span className="absolute bottom-3 right-3 bg-background/80 backdrop-blur text-xs px-3 py-1">
                      {photoIndex + 1} / {photos.length}
                    </span>
                  </>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Sem foto
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-6 sm:grid-cols-8 gap-2">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setPhotoIndex(i)}
                  className={cn(
                    "aspect-square overflow-hidden bg-card border-2",
                    i === photoIndex ? "border-foreground" : "border-transparent",
                  )}
                >
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            {data.brand}
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-light tracking-tight">
            {data.model}
            {data.version && (
              <span className="block text-xl text-muted-foreground mt-1">{data.version}</span>
            )}
          </h1>

          <p className="mt-6 text-3xl font-light">{formatPrice(Number(data.price))}</p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6">
            <Spec label="Ano" value={`${data.year_manufacture}/${data.year_model}`} />
            <Spec label="Quilometragem" value={formatMileage(data.mileage)} />
            <Spec label="Câmbio" value={TRANSMISSION_LABELS[data.transmission]} />
            <Spec label="Combustível" value={FUEL_LABELS[data.fuel]} />
            <Spec label="Cor" value={data.color} />
            {data.doors && <Spec label="Portas" value={String(data.doors)} />}
            {data.plate_end && <Spec label="Final de placa" value={data.plate_end} />}
          </dl>

          <a
            href={whatsappLink(data)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 w-full inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com vendedor
          </a>
          <p className="mt-3 text-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Atendimento via WhatsApp
          </p>
        </div>
      </section>

      {/* Description + features */}
      <section className="mx-auto max-w-[1600px] w-full px-6 lg:px-10 pb-24 grid lg:grid-cols-2 gap-12">
        {data.description && (
          <div>
            <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Descrição
            </h2>
            <p className="text-foreground/85 leading-relaxed whitespace-pre-line">
              {data.description}
            </p>
          </div>
        )}

        {data.features.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Opcionais e equipamentos
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {data.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-base font-light">{value}</dd>
    </div>
  );
}
