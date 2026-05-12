import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroVideoBackground } from "@/components/hero-video-background";

export const metadata: Metadata = {
  title: "Contato — Rodovia Veículos",
  description:
    "Fale com a Rodovia Veículos. WhatsApp, telefone, endereço em Sobradinho — Brasília e horário de atendimento.",
};

const PHONE_DISPLAY = "(61) 3387-2700";
const PHONE_TEL = "tel:+556133872700";
const WHATSAPP_DISPLAY = "(61) 99971-9187";
const WHATSAPP_URL = "https://wa.me/556199719187";
const ADDRESS_LINE_1 = "Quadra 6, CL 03 — Loja 03";
const ADDRESS_LINE_2 = "Sobradinho, Brasília — DF · CEP 73.026-510";
const MAPS_URL =
  "https://www.google.com/maps/place/Rodovia+Ve%C3%ADculos/@-15.6521107,-47.8025031,17z/data=!3m1!4b1!4m6!3m5!1s0x935a3f81c27911c1:0x5db2f04c15726fcf!8m2!3d-15.6521107!4d-47.8025031!16s%2Fg%2F11b6r_wt_1?entry=ttu";

import { Phone, MapPin, Clock, Globe, Instagram, Facebook, ArrowUpRight } from "lucide-react";

export default function ContatoPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteHeader />

      {/* Hero com vídeo de fundo */}
      <HeroVideoBackground videoSrc="/videos/hero-background.mp4">
        <div className="flex flex-col items-center text-center">
          <p className="text-[11px] uppercase tracking-[0.5em] text-foreground/70 mb-6 pl-[0.5em] animate-hero-kicker">
            Fale conosco
          </p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight animate-hero-title">
            Contato
          </h1>
          <p className="mt-6 max-w-xl text-foreground/80 animate-hero-copy">
            Escolha o canal para falar direto com a gente.
          </p>
        </div>

        {/* Estilos de animação do hero */}
        <style>{`
          @keyframes heroKicker {
            0% { opacity: 0; letter-spacing: 0.2em; transform: translateY(10px); }
            100% { opacity: 1; letter-spacing: 0.5em; transform: translateY(0); }
          }

          @keyframes heroTitle {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes heroCopy {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          .animate-hero-kicker {
            animation: heroKicker 500ms ease-out 100ms both;
          }

          .animate-hero-title {
            animation: heroTitle 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both;
          }

          .animate-hero-copy {
            animation: heroCopy 500ms ease-out 400ms both;
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-hero-kicker,
            .animate-hero-title,
            .animate-hero-copy {
              animation: none;
              opacity: 1;
              transform: none;
              letter-spacing: 0.5em;
            }
          }
        `}</style>
      </HeroVideoBackground>

      {/* Cards de contato */}
      <section className="py-24 mx-auto max-w-[1600px] px-6 lg:px-10 grid lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border bg-card/40 p-8 flex gap-5 hover:border-foreground/40 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border">
              <WhatsAppIcon className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                WhatsApp
              </h3>
              <p className="text-base text-foreground">{WHATSAPP_DISPLAY}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-foreground/80 group-hover:text-foreground transition-colors">
                Iniciar conversa
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </a>

          <a
            href={PHONE_TEL}
            className="group border border-border bg-card/40 p-8 flex gap-5 hover:border-foreground/40 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border">
              <Phone className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                Telefone
              </h3>
              <p className="text-base text-foreground">{PHONE_DISPLAY}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-foreground/80 group-hover:text-foreground transition-colors">
                Ligar agora
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </a>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border bg-card/40 p-8 flex gap-5 hover:border-foreground/40 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border">
              <MapPin className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                Endereço
              </h3>
              <p className="text-base text-foreground leading-relaxed">
                {ADDRESS_LINE_1}
                <br />
                <span className="text-muted-foreground">{ADDRESS_LINE_2}</span>
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-foreground/80 group-hover:text-foreground transition-colors">
                Como chegar
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </a>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-border bg-card/40 p-8 flex gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border">
              <Clock className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                Horário de atendimento
              </h3>
              <ul className="text-base text-foreground space-y-1.5">
                <li className="flex justify-between gap-6">
                  <span className="text-muted-foreground">Seg — Sex</span>
                  <span>08h — 19h</span>
                </li>
                <li className="flex justify-between gap-6">
                  <span className="text-muted-foreground">Sábado</span>
                  <span>09h — 16h</span>
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
              <Globe className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                Redes sociais
              </h3>
              <div className="flex flex-col gap-3">
                <a
                  href="https://instagram.com/rodovia.veiculos/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-sm text-foreground hover:text-foreground/70 transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  @rodovia.veiculos
                  <ArrowUpRight className="h-3.5 w-3.5 ml-auto" />
                </a>
                <a
                  href="https://www.facebook.com/rodoviaveiculosltda/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-sm text-foreground hover:text-foreground/70 transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                  Rodovia Veículos
                  <ArrowUpRight className="h-3.5 w-3.5 ml-auto" />
                </a>
              </div>
            </div>
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-5 text-xs uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors"
          >
            Falar agora no WhatsApp
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.898 9.82 9.82 0 0 1 2.892 6.994c-.002 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413" />
    </svg>
  );
}
