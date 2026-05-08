import type { Metadata } from "next";

import Link from "next/link";
import { ArrowRight, Car, MapPin, CalendarCheck, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroCar from "@/assets/hero-rodovia.jpg";

export const metadata: Metadata = {
  title: "Delivery de Test-Drive — Rodovia Veículos",
  description:
    "Levamos o veículo até você para um test-drive sem custo e sem compromisso. Escolha o modelo no estoque e agende pelo WhatsApp.",
};

const steps = [
  {
    icon: Car,
    title: "Escolha o modelo",
    text: "Navegue pelo nosso estoque e selecione o veículo que deseja experimentar.",
  },
  {
    icon: CalendarCheck,
    title: "Agende pelo WhatsApp",
    text: "Combine dia, horário e endereço — em casa ou no trabalho, como preferir.",
  },
  {
    icon: MapPin,
    title: "Levamos até você",
    text: "Nossa equipe leva o carro até o local combinado, dentro do Distrito Federal.",
  },
  {
    icon: ShieldCheck,
    title: "Test-drive sem compromisso",
    text: "Experimente o veículo com calma. Sem custo, sem pressão e sem compromisso de compra.",
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

      <section className="py-24 mx-auto max-w-[1600px] px-6 lg:px-10 grid md:grid-cols-2 gap-16">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">
            Como funciona
          </p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight leading-[1.1]">
            O Test Drive vai
            <br />
            <span className="italic font-extralight text-muted-foreground">
              até você.
            </span>
          </h2>
        </div>
        <div className="text-muted-foreground leading-relaxed space-y-4">
          <p>
            Sabemos que seu tempo é valioso. Por isso a Rodovia Veículos oferece o serviço de
            delivery de test-drive: você escolhe o modelo, define o local e o horário, e nós levamos
            o carro até você no Distrito Federal.
          </p>
          <p>
            É a forma mais cômoda e segura de avaliar o veículo antes da compra — sem deslocamentos,
            sem filas e, principalmente, sem nenhum compromisso.
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
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6">
            Pronto para experimentar?
          </p>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            Escolha seu próximo carro
            <br />
            <span className="italic font-extralight text-muted-foreground">sem sair de casa.</span>
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
