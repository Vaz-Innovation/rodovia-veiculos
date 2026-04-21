import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, type FormEvent } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Check,
  Heart,
  Share2,
  Phone,
  Calendar,
  Gauge,
  Settings2,
  Fuel,
  Palette,
  DoorOpen,
  Hash,
  Star,
  X,
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

function NotFoundView() {
  return (
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
  );
}

type VehicleWithPhotos = Vehicle & { vehicle_photos: VehiclePhoto[] };

function VehicleDetailPage() {
  const { vehicleId } = Route.useParams();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

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
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <div className="aspect-[16/10] bg-card animate-pulse" />
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
    return <NotFoundView />;
  }

  const photos = [...data.vehicle_photos].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position,
  );
  const current = photos[photoIndex];

  const next = () => setPhotoIndex((i) => (i + 1) % Math.max(photos.length, 1));
  const prev = () =>
    setPhotoIndex((i) => (i - 1 + Math.max(photos.length, 1)) % Math.max(photos.length, 1));

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: vehicleTitle(data), url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <SiteHeader />

      {/* Breadcrumb */}
      <section className="pt-28 pb-4 mx-auto max-w-[1600px] w-full px-6 lg:px-10">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/estoque" className="hover:text-foreground inline-flex items-center gap-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao estoque
          </Link>
          <span className="text-border">/</span>
          <span>{data.brand}</span>
          <span className="text-border">/</span>
          <span className="text-foreground">{data.model}</span>
        </nav>
      </section>

      {/* Top section: Gallery + Sticky Info */}
      <section className="mx-auto max-w-[1600px] w-full px-6 lg:px-10 pb-12 grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Gallery */}
        <div>
          {/* Main image */}
          <div className="relative bg-card overflow-hidden aspect-[16/10] group">
            {current ? (
              <>
                <button
                  onClick={() => setLightbox(true)}
                  className="block w-full h-full"
                  aria-label="Ampliar foto"
                >
                  <img
                    src={current.url}
                    alt={vehicleTitle(data)}
                    className="h-full w-full object-cover"
                  />
                </button>
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur p-3 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur p-3 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Próxima foto"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {data.featured && (
                    <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 inline-flex items-center gap-1.5">
                      <Star className="h-3 w-3" /> Destaque
                    </span>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={share}
                    className="bg-background/90 backdrop-blur p-2.5 hover:bg-background"
                    aria-label="Compartilhar"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    className="bg-background/90 backdrop-blur p-2.5 hover:bg-background"
                    aria-label="Favoritar"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                {photos.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur text-xs px-3 py-1.5 font-light">
                    {photoIndex + 1} / {photos.length}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Sem foto
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div ref={stripRef} className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setPhotoIndex(i)}
                  className={cn(
                    "shrink-0 w-24 h-20 overflow-hidden bg-card border-2 transition-all",
                    i === photoIndex
                      ? "border-foreground"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sticky info card */}
        <aside className="lg:sticky lg:top-28 lg:self-start space-y-4">
          <div className="bg-card border border-border p-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              {data.brand}
            </p>
            <h1 className="mt-2 text-2xl font-light tracking-tight">{data.model}</h1>
            {data.version && (
              <p className="mt-1 text-sm text-muted-foreground uppercase tracking-wide">
                {data.version}
              </p>
            )}

            <div className="mt-6 pb-6 border-b border-border">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Preço à vista
              </p>
              <p className="mt-1 text-3xl font-light text-primary">
                {formatPrice(Number(data.price))}
              </p>
            </div>

            {/* Quick highlights */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <Highlight icon={Calendar} label="Ano" value={`${data.year_manufacture}/${data.year_model}`} />
              <Highlight icon={Gauge} label="Km" value={formatMileage(data.mileage)} />
              <Highlight icon={Settings2} label="Câmbio" value={TRANSMISSION_LABELS[data.transmission]} />
              <Highlight icon={Fuel} label="Combustível" value={FUEL_LABELS[data.fuel]} />
            </div>
          </div>

          {/* Contact card */}
          <ContactCard vehicle={data} />
        </aside>
      </section>

      {/* Full spec sheet */}
      <section className="mx-auto max-w-[1600px] w-full px-6 lg:px-10 pb-12 lg:grid-cols-[1fr_400px] grid gap-8">
        <div>
          <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 pb-3 border-b border-border">
            Ficha técnica
          </h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-6">
            <Spec icon={Calendar} label="Ano modelo" value={String(data.year_model)} />
            <Spec icon={Calendar} label="Ano fabricação" value={String(data.year_manufacture)} />
            <Spec icon={Gauge} label="Quilometragem" value={formatMileage(data.mileage)} />
            <Spec icon={Settings2} label="Câmbio" value={TRANSMISSION_LABELS[data.transmission]} />
            <Spec icon={Fuel} label="Combustível" value={FUEL_LABELS[data.fuel]} />
            <Spec icon={Palette} label="Cor" value={data.color} />
            {data.doors !== null && data.doors !== undefined && (
              <Spec icon={DoorOpen} label="Portas" value={String(data.doors)} />
            )}
            {data.plate_end && (
              <Spec icon={Hash} label="Final de placa" value={data.plate_end} />
            )}
          </dl>
        </div>
        <div className="hidden lg:block" />
      </section>

      {/* Description + Features */}
      {(data.description || data.features.length > 0) && (
        <section className="mx-auto max-w-[1600px] w-full px-6 lg:px-10 pb-24 grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-12">
            {data.description && (
              <div>
                <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 pb-3 border-b border-border">
                  Sobre o veículo
                </h2>
                <p className="text-foreground/85 leading-relaxed whitespace-pre-line text-[15px]">
                  {data.description}
                </p>
              </div>
            )}

            {data.features.length > 0 && (
              <div>
                <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 pb-3 border-b border-border">
                  Itens e opcionais
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                  {data.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="hidden lg:block" />
        </section>
      )}

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border p-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">A partir de</p>
          <p className="text-lg font-light text-primary">{formatPrice(Number(data.price))}</p>
        </div>
        <a
          href={whatsappLink(data)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-xs uppercase tracking-[0.2em]"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>

      <SiteFooter />

      {/* Lightbox */}
      {lightbox && current && (
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
            src={current.url}
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

function Highlight({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="text-sm font-light truncate">{value}</p>
      </div>
    </div>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-base font-light">{value}</dd>
      </div>
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
    <div className="bg-card border border-border p-6">
      <h3 className="text-sm font-medium mb-1">Fale com a Rodovia</h3>
      <p className="text-xs text-muted-foreground mb-5">
        Envie uma mensagem ao vendedor pelo WhatsApp.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground/40"
        />
        <input
          type="tel"
          placeholder="Telefone (opcional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground/40"
        />
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground/40 resize-none"
        />
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-xs uppercase tracking-[0.25em] hover:bg-primary/90"
        >
          <MessageCircle className="h-4 w-4" />
          Enviar via WhatsApp
        </button>
      </form>
      <a
        href="tel:+556199719187"
        className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-border px-5 py-3 text-xs uppercase tracking-[0.25em] hover:bg-background"
      >
        <Phone className="h-4 w-4" /> (61) 99971-9187
      </a>
    </div>
  );
}
