import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Clock, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const MAPS_URL =
  "https://www.google.com/maps/place/Rodovia+Ve%C3%ADculos/@-15.6521107,-47.8025031,17z/data=!3m1!4b1!4m6!3m5!1s0x935a3f81c27911c1:0x5db2f04c15726fcf!8m2!3d-15.6521107!4d-47.8025031!16s%2Fg%2F11b6r_wt_1?entry=ttu";

const MAPS_EMBED =
  "https://www.google.com/maps?q=-15.6521107,-47.8025031&hl=pt-BR&z=17&output=embed";

export const Route = createFileRoute("/localizacao")({
  head: () => ({
    meta: [
      { title: "Localização — Rodovia Veículos" },
      {
        name: "description",
        content:
          "Visite a Rodovia Veículos. Veja nosso endereço, horário de atendimento e como chegar.",
      },
      { property: "og:title", content: "Localização — Rodovia Veículos" },
      {
        property: "og:description",
        content: "Endereço, horário e rota até a Rodovia Veículos.",
      },
    ],
  }),
  component: LocalizacaoPage,
});

function LocalizacaoPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteHeader />

      <section className="pt-32 pb-12 mx-auto max-w-[1600px] px-6 lg:px-10">
        <p className="text-[11px] uppercase tracking-[0.5em] text-foreground/70 mb-6 pl-[0.5em]">
          Venha nos visitar
        </p>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight">
          Localização
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Estamos prontos para te receber. Conheça nosso showroom e nosso
          estoque pessoalmente.
        </p>
      </section>

      <section className="pb-24 mx-auto max-w-[1600px] px-6 lg:px-10 grid lg:grid-cols-[1fr_1.2fr] gap-10">
        <div className="flex flex-col gap-8">
          <div className="flex gap-4">
            <MapPin className="h-5 w-5 text-foreground/80 mt-1 shrink-0" />
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-foreground/70 mb-2">
                Endereço
              </h3>
              <p className="text-base text-foreground leading-relaxed">
                Rodovia Veículos
                <br />
                Brasília — DF
              </p>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-foreground hover:text-foreground/70 transition-colors border-b border-foreground/40 pb-1"
              >
                Abrir no Google Maps
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="flex gap-4">
            <Clock className="h-5 w-5 text-foreground/80 mt-1 shrink-0" />
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-foreground/70 mb-2">
                Horário
              </h3>
              <p className="text-base text-foreground leading-relaxed">
                Segunda a Sexta · 08h — 18h
                <br />
                Sábado · 09h — 14h
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Phone className="h-5 w-5 text-foreground/80 mt-1 shrink-0" />
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-foreground/70 mb-2">
                Contato
              </h3>
              <p className="text-base text-foreground leading-relaxed">
                Fale conosco pelo WhatsApp ou telefone para agendar sua
                visita ou test-drive em casa.
              </p>
            </div>
          </div>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex w-fit items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors"
          >
            Como chegar
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </div>

        <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[500px] overflow-hidden border border-border bg-card">
          <iframe
            title="Mapa da Rodovia Veículos"
            src={MAPS_EMBED}
            className="h-full w-full grayscale contrast-110"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
