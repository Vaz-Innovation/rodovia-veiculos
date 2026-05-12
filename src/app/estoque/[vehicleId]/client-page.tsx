"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Check,
  Heart,
  Share2,
  Phone,
  X,
  Star,
} from "lucide-react";
import { toast } from "sonner";

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
} from "@/lib/vehicles";
import { cn } from "@/lib/utils";
import { NotFoundView } from "./_components/not-found-view";
import { SpecItem } from "./_components/spec-item";
import { ContactCard } from "./_components/contact-card";

import { CarByIdQuery } from "./query";
import { gqlQueryOptions } from "@/graphql/gqlpc";
import { useVehicleMapper } from "@/hooks/useVehicleMapper";

export function VehicleDetailClient({ vehicleId }: { vehicleId: string }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const mapProductToVehicle = useVehicleMapper();
  const {
    data: queryData,
    isLoading,
    error,
  } = useQuery(gqlQueryOptions(CarByIdQuery, { input: { id: vehicleId } }));

  const data = queryData?.product ? mapProductToVehicle(queryData.product) : null;

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <SiteHeader />
        <div className="pt-32 mx-auto max-w-350 px-6 lg:px-10">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-4/3 bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) return <NotFoundView />;

  const photos = [...data.vehicle_photos].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || (a.position ?? 0) - (b.position ?? 0),
  );

  const total = Math.max(photos.length, 1);
  const next = () => setPhotoIndex((i) => (i + 1) % total);
  const prev = () => setPhotoIndex((i) => (i - 1 + total) % total);

  const visiblePhotos =
    photos.length === 0
      ? []
      : photos.length <= 3
        ? photos
        : [0, 1, 2].map((offset) => photos[(photoIndex + offset) % photos.length]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: vehicleTitle(data), url });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <SiteHeader />

      <section className="pt-28 pb-3 mx-auto max-w-350 w-full px-4 lg:px-8">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Link href="/estoque" className="hover:text-foreground inline-flex items-center gap-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Estoque
          </Link>
          <span className="text-border">/</span>
          <span>{data.brand}</span>
          <span className="text-border">/</span>
          <span className="text-foreground">{data.model}</span>
        </nav>
        <div className="py-4">
          <span className="text-3xl ">{data.name}</span>
        </div>
      </section>

      <section className="mx-auto max-w-350 w-full md:px-4 lg:px-8">
        <div className="relative">
          <div className="md:hidden mx-0">
            {photos.length > 0 ? (
              <div
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const idx = Math.round(el.scrollLeft / el.clientWidth);
                  if (idx !== photoIndex) setPhotoIndex(idx);
                }}
              >
                {photos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPhotoIndex(photos.indexOf(p));
                      setLightbox(true);
                    }}
                    className="relative shrink-0 w-full snap-center bg-card overflow-hidden aspect-4/3"
                    aria-label="Ampliar foto"
                  >
                    <img
                      src={p.url}
                      alt={vehicleTitle(data)}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="aspect-video bg-card flex items-center justify-center text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Sem fotos
              </div>
            )}
          </div>

          <div className="hidden md:grid grid-cols-3 gap-2">
            {visiblePhotos.length > 0 ? (
              visiblePhotos.map((p, i) => (
                <button
                  key={`${p.id}-${i}`}
                  onClick={() => {
                    setPhotoIndex(photos.indexOf(p));
                    setLightbox(true);
                  }}
                  className="relative block bg-card overflow-hidden aspect-4/3 rounded-sm group"
                  aria-label="Ampliar foto"
                >
                  <img
                    src={p.url}
                    alt={vehicleTitle(data)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </button>
              ))
            ) : (
              <div className="col-span-3 aspect-16/6 bg-card flex items-center justify-center text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Sem fotos
              </div>
            )}
          </div>

          {photos.length > 3 && (
            <>
              <button
                onClick={prev}
                className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 bg-background/90 border border-border w-11 h-11 rounded-full items-center justify-center text-foreground"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-background/90 border border-border w-11 h-11 rounded-full items-center justify-center text-foreground"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {photos.length > 0 && (
            <div className="absolute bottom-3 right-3 bg-foreground/80 text-background text-xs px-3 py-1.5 rounded pointer-events-none">
              {photoIndex + 1} / {photos.length}
            </div>
          )}

          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={share}
              className="bg-background/90 border border-border w-10 h-10 rounded-full flex items-center justify-center text-foreground"
              aria-label="Compartilhar"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              className="bg-background/90 border border-border w-10 h-10 rounded-full flex items-center justify-center text-foreground"
              aria-label="Favoritar"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {photos.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setPhotoIndex(i)}
                className={cn(
                  "shrink-0 w-20 h-16 overflow-hidden bg-card rounded-sm border-2 transition-all",
                  i === photoIndex
                    ? "border-foreground"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-350 w-full px-4 lg:px-8 pb-12 mt-6 grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="bg-card border border-border p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight uppercase">
                {data.brand} <span className="text-foreground">{data.model}</span>
              </h1>
              {data.version && (
                <p className="mt-1 text-sm text-muted-foreground uppercase tracking-wide">
                  {data.version}
                </p>
              )}
            </div>
            {data.featured && (
              <span className="bg-foreground text-background text-[11px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 font-medium">
                <Star className="h-3 w-3" /> Oferta destaque
              </span>
            )}
          </div>

          <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
            {(data.city || data.district) && (
              <SpecItem 
                label="Cidade" 
                value={[data.city, data.district].filter((s): s is string => Boolean(s)).map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(" - ")} 
              />
            )}
            <SpecItem label="Ano" value={`${data.year_manufacture}/${data.year_model}`} />
            <SpecItem label="KM" value={formatMileage(data.mileage)} />
            <SpecItem label="Câmbio" value={TRANSMISSION_LABELS[data.transmission] || data.transmission} />
            <SpecItem label="Combustível" value={FUEL_LABELS[data.fuel] || data.fuel} />
            {data.color && <SpecItem label="Cor" value={data.color} />}
            {data.engine && <SpecItem label="Motor" value={data.engine} />}
            {data.doors !== null && data.doors !== undefined && (
              <SpecItem label="Portas" value={String(data.doors)} />
            )}
            {data.condition && <SpecItem label="Condição" value={data.condition} />}
            {data.plate_end && <SpecItem label="Final de placa" value={data.plate_end} />}
          </dl>

          {data.description && (
            <div className="mt-10 pt-8 border-t border-border">
              <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Sobre o veículo
              </h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-[15px]">
                {data.description}
              </p>
            </div>
          )}

          {data.features.length > 0 && (
            <div className="mt-10 pt-8 border-t border-border">
              <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Itens e opcionais
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {data.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="h-4 w-4 mt-0.5 text-foreground shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start space-y-4">
          <div className="bg-card border border-border p-6">
            <p className="text-4xl font-light text-foreground">{formatPrice(Number(data.price))}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Preço à vista
            </p>

            <a
              href={whatsappLink(data)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Falar com vendedor
            </a>
          </div>

          <ContactCard vehicle={data} />
        </aside>
      </section>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border p-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            A partir de
          </p>
          <p className="text-lg font-medium text-foreground">{formatPrice(Number(data.price))}</p>
        </div>
        <a
          href={whatsappLink(data)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-xs uppercase tracking-[0.15em] font-medium"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>

      <SiteFooter />

      {lightbox && photos[photoIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2"
            onClick={() => setLightbox(false)}
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <img
            src={photos[photoIndex].url}
            alt={vehicleTitle(data)}
            className="max-w-[92vw] max-h-[88vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs uppercase tracking-[0.3em]">
            {photoIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
