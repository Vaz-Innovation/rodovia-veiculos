import type { Metadata } from "next";

import Link from "next/link";
import { ArrowRight, Car, MapPin, CalendarCheck, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroCar from "@/assets/hero-rodovia.jpg";

const description =
  "Levamos o veículo até você para um test-drive sem custo e sem compromisso. Escolha o modelo no estoque e agende pelo WhatsApp.";

export const metadata: Metadata = {
  title: "Delivery de Test-Drive",
  description,
};

const steps = [
  {
    icon: Car,
    title: "Escolha o modelo",
    text: "Selecione o veículo no estoque.",
  },
  {
    icon: CalendarCheck,
    title: "Agende pelo WhatsApp",
    text: "Combinamos dia, hora e local. Na sua casa ou no seu trabalho. Como você preferir.",
  },
  {
    icon: MapPin,
    title: "O veículo vai até você",
    text: "Nossa equipe leva o carro até você, no Distrito Federal. E avalia o seu.",
  },
  {
    icon: ShieldCheck,
    title: "Test drive",
    text: "Sem custo. Sem compromisso.",
  },
];

export default function DeliveryPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteHeader />

      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img
          src={heroCar.src}
          alt="Delivery de test-drive Rodovia Veículos"
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="relative z-10 mx-auto max-w-[1600px] h-full px-6 lg:px-10 flex flex-col justify-end pb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">
            Sem custo · Sem compromisso
          </p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight">
            Delivery de <span className="italic font-extralight">test-drive</span>
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg text-foreground/75 leading-relaxed">
            Gostou de um modelo? Nós levamos o carro até a sua casa ou trabalho para você conhecer,
            com tranquilidade.
          </p>
        </div>
      </section>

      <section className="py-24 mx-auto max-w-[1200px] px-6 lg:px-10">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6">
            Como funciona
          </p>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.1] mb-8">
            O Test Drive vai{" "}
            <span className="italic font-extralight text-muted-foreground">até você.</span>
          </h2>
          <div className="w-16 h-px bg-foreground/30 mb-8" />
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            A Rodovia Veículos oferece o Delivery de test drive para otimizar seu tempo. Você
            escolhe o modelo, combinamos o horário e levamos o carro até você, no Distrito Federal.
          </p>
        </div>
      </section>

      <section className="pb-24 mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-border">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="border-b border-r border-border last:border-r-0 md:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0 p-8 lg:p-10"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
                  Etapa 0{i + 1}
                </p>
                <Icon className="h-6 w-6 mb-6 text-foreground" strokeWidth={1.25} />
                <h3 className="text-xl font-light mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-card py-24">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            Escolha agora o veículo.
            <br />E o conheça.{" "}
            <span className="italic font-extralight text-muted-foreground">Sem sair de casa.</span>
          </h2>
          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <Link
              href="/estoque"
              className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors"
            >
              Ver estoque
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/556199719187?text=Ol%C3%A1%21%20Gostaria%20de%20agendar%20um%20test-drive%20com%20delivery."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-foreground/30 text-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-foreground hover:text-background transition-colors"
            >
              Agendar pelo WhatsApp
            </a>
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Atendimento no Distrito Federal · (61) 99971-9187
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
