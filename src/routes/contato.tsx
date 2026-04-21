import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, MapPin, Clock, Globe, Instagram, Facebook, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const PHONE_DISPLAY = "(61) 3387-2700";
const PHONE_TEL = "tel:+556133872700";
const WHATSAPP_DISPLAY = "(61) 99971-9187";
const WHATSAPP_URL = "https://wa.me/556199719187";
const ADDRESS_LINE_1 = "Quadra 6, CL 03 — Loja 03";
const ADDRESS_LINE_2 = "Sobradinho, Brasília — DF · CEP 73.026-510";
const MAPS_URL =
  "https://www.google.com/maps/place/Rodovia+Ve%C3%ADculos/@-15.6521107,-47.8025031,17z/data=!3m1!4b1!4m6!3m5!1s0x935a3f81c27911c1:0x5db2f04c15726fcf!8m2!3d-15.6521107!4d-47.8025031!16s%2Fg%2F11b6r_wt_1?entry=ttu";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Rodovia Veículos" },
      {
        name: "description",
        content:
          "Fale com a Rodovia Veículos. WhatsApp, telefone, endereço em Sobradinho — Brasília e horário de atendimento.",
      },
      { property: "og:title", content: "Contato — Rodovia Veículos" },
      {
        property: "og:description",
        content:
          "WhatsApp, telefone e endereço da Rodovia Veículos em Sobradinho, Brasília — DF.",
      },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteHeader />

      <section className="pt-32 pb-12 mx-auto max-w-[1600px] px-6 lg:px-10">
        <p className="text-[11px] uppercase tracking-[0.5em] text-foreground/70 mb-6 pl-[0.5em]">
          Fale conosco
        </p>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight">
          Contato
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Estamos prontos para te atender. Escolha o canal que preferir e
          fale com nossa equipe.
        </p>
      </section>

      <section className="pb-24 mx-auto max-w-[1600px] px-6 lg:px-10 grid lg:grid-cols-2 gap-8">
        {/* Coluna esquerda: canais diretos */}
        <div className="flex flex-col gap-6">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border bg-card/40 p-8 flex gap-5 hover:border-foreground/40 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border">
              <MessageCircle className="h-4 w-4 text-foreground" />
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

        {/* Coluna direita: horário + redes */}
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
          <p className="text-center text-[11px] uppercase tracking-[0.3em] text-foreground/60">
            Resposta em até 30 minutos
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
