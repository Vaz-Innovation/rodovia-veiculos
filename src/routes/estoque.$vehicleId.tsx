import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
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
  type Vehicle,
  type VehiclePhoto,
} from "@/lib/vehicles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estoque/$vehicleId")({
  component: VehicleDetailPage,
});

type VehicleWithPhotos = Vehicle & { vehicle_photos: VehiclePhoto[] };

function NotFoundView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] text-slate-900">
      <div className="text-center">
        <h1 className="text-3xl font-light">Veículo não encontrado</h1>
        <Link
          to="/estoque"
          search={{}}
          className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao estoque
        </Link>
      </div>
    </div>
  );
}

function VehicleDetailPage() {
  const { vehicleId } = Route.useParams();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

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
      <div className="bg-[#f3f4f6] min-h-screen">
        <SiteHeader />
        <div className="pt-32 mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/3] bg-slate-200 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <NotFoundView />;
  }

  const photos = [...data.vehicle_photos].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position,
  );

  const total = Math.max(photos.length, 1);
  const next = () => setPhotoIndex((i) => (i + 1) % total);
  const prev = () => setPhotoIndex((i) => (i - 1 + total) % total);

  // For the 3-up carousel strip we show 3 consecutive photos starting at photoIndex
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
    <div className="bg-[#f3f4f6] text-slate-900 min-h-screen flex flex-col">
      <SiteHeader />

      {/* Breadcrumb */}
      <section className="pt-28 pb-3 mx-auto max-w-[1400px] w-full px-4 lg:px-8">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
          <Link to="/estoque" search={{}} className="hover:text-slate-900 inline-flex items-center gap-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Estoque
          </Link>
          <span className="text-slate-300">/</span>
          <span>{data.brand}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">{data.model}</span>
        </nav>
      </section>

      {/* Carousel: scroll-snap on mobile, 3-up grid on desktop (Webmotors style) */}
      <section className="mx-auto max-w-[1400px] w-full md:px-4 lg:px-8">
        <div className="relative">
          {/* Mobile: horizontal scroll-snap */}
          <div className="md:hidden -mx-0">
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
                    className="relative shrink-0 w-full snap-center bg-slate-200 overflow-hidden aspect-[4/3]"
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
              <div className="aspect-[16/9] bg-slate-200 flex items-center justify-center text-slate-500 text-xs uppercase tracking-[0.2em]">
                Sem fotos
              </div>
            )}
          </div>

          {/* Desktop: 3-up grid */}
          <div className="hidden md:grid grid-cols-3 gap-2">
            {visiblePhotos.length > 0 ? (
              visiblePhotos.map((p, i) => (
                <button
                  key={`${p.id}-${i}`}
                  onClick={() => {
                    setPhotoIndex(photos.indexOf(p));
                    setLightbox(true);
                  }}
                  className="relative block bg-slate-200 overflow-hidden aspect-[4/3] rounded-sm group"
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
              <div className="col-span-3 aspect-[16/6] bg-slate-200 flex items-center justify-center text-slate-500 text-xs uppercase tracking-[0.2em]">
                Sem fotos
              </div>
            )}
          </div>

          {photos.length > 3 && (
            <>
              <button
                onClick={prev}
                className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-md w-11 h-11 rounded-full items-center justify-center text-slate-700"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-md w-11 h-11 rounded-full items-center justify-center text-slate-700"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {photos.length > 0 && (
            <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded pointer-events-none">
              {photoIndex + 1} / {photos.length}
            </div>
          )}

          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={share}
              className="bg-white/95 hover:bg-white shadow-md w-10 h-10 rounded-full flex items-center justify-center text-slate-700"
              aria-label="Compartilhar"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              className="bg-white/95 hover:bg-white shadow-md w-10 h-10 rounded-full flex items-center justify-center text-slate-700"
              aria-label="Favoritar"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setPhotoIndex(i)}
                className={cn(
                  "shrink-0 w-20 h-16 overflow-hidden bg-slate-200 rounded-sm border-2 transition-all",
                  i === photoIndex
                    ? "border-primary"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Main info: white card overlapping bottom of gallery + sticky price card */}
      <section className="mx-auto max-w-[1400px] w-full px-4 lg:px-8 pb-12 mt-6 grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Vehicle info card */}
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-slate-900">
                {data.brand} <span className="text-primary">{data.model}</span>
              </h1>
              {data.version && (
                <p className="mt-1 text-sm text-slate-500 uppercase tracking-wide">
                  {data.version}
                </p>
              )}
            </div>
            {data.featured && (
              <span className="bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 font-medium">
                <Star className="h-3 w-3" /> Oferta destaque
              </span>
            )}
          </div>

          {/* Spec grid */}
          <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
            <SpecItem label="Cidade" value="Brasília - DF" />
            <SpecItem label="Ano" value={`${data.year_manufacture}/${data.year_model}`} />
            <SpecItem label="KM" value={formatMileage(data.mileage)} />
            <SpecItem label="Câmbio" value={TRANSMISSION_LABELS[data.transmission]} />
            <SpecItem label="Combustível" value={FUEL_LABELS[data.fuel]} />
            {data.plate_end && <SpecItem label="Final de placa" value={data.plate_end} />}
            <SpecItem label="Cor" value={data.color} />
            {data.doors !== null && data.doors !== undefined && (
              <SpecItem label="Portas" value={String(data.doors)} />
            )}
          </dl>

          {/* Description */}
          {data.description && (
            <div className="mt-10 pt-8 border-t border-slate-200">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-4">
                Sobre o veículo
              </h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[15px]">
                {data.description}
              </p>
            </div>
          )}

          {/* Features */}
          {data.features.length > 0 && (
            <div className="mt-10 pt-8 border-t border-slate-200">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-4">
                Itens e opcionais
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {data.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sticky price + contact */}
        <aside className="lg:sticky lg:top-28 lg:self-start space-y-4">
          <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
            <p className="text-4xl font-bold text-slate-900">{formatPrice(Number(data.price))}</p>
            <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider">Preço à vista</p>

            <a
              href={whatsappLink(data)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3.5 rounded text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Falar com vendedor
            </a>
          </div>

          <ContactCard vehicle={data} />
        </aside>
      </section>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 p-3 flex items-center gap-3 shadow-lg">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">A partir de</p>
          <p className="text-lg font-bold text-slate-900">{formatPrice(Number(data.price))}</p>
        </div>
        <a
          href={whatsappLink(data)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded text-xs uppercase tracking-[0.15em] font-semibold"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>

      <SiteFooter />

      {/* Lightbox */}
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

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 mb-1">{label}</dt>
      <dd className="text-base font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function ContactCard({ vehicle }: { vehicle: VehicleWithPhotos }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year_model}. Aguardo retorno.`,
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `${message}\n\nNome: ${name}${phone ? `\nTelefone: ${phone}` : ""}`,
    );
    window.open(`https://wa.me/556199719187?text=${text}`, "_blank", "noopener");
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        Envie uma mensagem ao vendedor
      </h3>
      <p className="text-xs text-slate-500 mb-5">Resposta direta pelo WhatsApp.</p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Nome*"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary"
        />
        <input
          type="tel"
          placeholder="Telefone (opcional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary"
        />
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-primary resize-none"
        />
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded text-sm font-semibold hover:bg-primary/90"
        >
          <MessageCircle className="h-4 w-4" />
          Enviar via WhatsApp
        </button>
      </form>
      <a
        href="tel:+556199719187"
        className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 rounded px-5 py-3 text-sm font-medium hover:bg-slate-50"
      >
        <Phone className="h-4 w-4" /> (61) 99971-9187
      </a>
    </div>
  );
}
