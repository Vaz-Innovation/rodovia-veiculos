import type { Metadata } from "next";

import { MapPin, Phone, Clock, ArrowUpRight } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const description =
  "Visite a Rodovia Veículos. Veja nosso endereço, horário de atendimento e como chegar.";

export const metadata: Metadata = {
  title: "Localização",
  description,
  openGraph: { title: "Localização | Rodovia Veículos", description, url: "/localizacao" },
  twitter: { title: "Localização | Rodovia Veículos", description },
};

const MAPS_URL =
  "https://www.google.com/maps/place/Rodovia+Ve%C3%ADculos/@-15.6521107,-47.8025031,17z/data=!3m1!4b1!4m6!3m5!1s0x935a3f81c27911c1:0x5db2f04c15726fcf!8m2!3d-15.6521107!4d-47.8025031!16s%2Fg%2F11b6r_wt_1?entry=ttu";

const MAPS_EMBED =
  "https://www.google.com/maps?q=-15.6521107,-47.8025031&hl=pt-BR&z=17&output=embed";

export default function LocalizacaoPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteHeader />

      <section className="pt-32 pb-12 mx-auto max-w-[1600px] px-6 lg:px-10">
        <p className="text-[11px] uppercase tracking-[0.5em] text-foreground/70 mb-6 pl-[0.5em]">
          Venha nos visitar
        </p>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight">Localização</h1>
      </section>

      <section className="pb-24 mx-auto max-w-[1600px] px-6 lg:px-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        <div className="flex flex-col gap-6">
          <div className="border border-border bg-card/40 p-8 flex gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border">
              <MapPin className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                Endereço
              </h3>
              <p className="text-base text-foreground leading-relaxed">
                Rodovia Veículos
                <br />
                <span className="text-muted-foreground">Brasília — DF</span>
              </p>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-foreground hover:text-foreground/70 transition-colors"
              >
                Abrir no Google Maps
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="border border-border bg-card/40 p-8 flex gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border">
              <Clock className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                Horário
              </h3>
              <ul className="text-base text-foreground space-y-1.5">
                <li className="flex justify-between gap-6">
                  <span className="text-muted-foreground">Seg — Sex</span>
                  <span>08h — 18h</span>
                </li>
                <li className="flex justify-between gap-6">
                  <span className="text-muted-foreground">Sábado</span>
                  <span>09h — 14h</span>
                </li>
                <li className="flex justify-between gap-6">
                  <span className="text-muted-foreground">Domingo</span>
                  <span>Fechado</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border border-border bg-card/40 p-8 flex gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border">
              <Phone className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                Atendimento
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fale conosco pelo WhatsApp ou telefone para agendar sua visita ou test-drive em
                casa.
              </p>
            </div>
          </div>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors"
          >
            Como chegar
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </div>

        <div className="overflow-hidden border border-border bg-card min-h-[500px] lg:min-h-0">
          <iframe
            title="Mapa da Rodovia Veículos"
            src={MAPS_EMBED}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
