import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroCinematic } from "@/components/hero-cinematic";

import model1 from "@/assets/car-hatch.jpg";
import model2 from "@/assets/car-sedan.jpg";
import model3 from "@/assets/car-suv.jpg";
import racing from "@/assets/racing.jpg";
import avaliacao from "@/assets/avaliacao-veiculo.jpg";

const featured = [
  { img: model1, name: "Hatch compacto", tag: "Econômico" },
  { img: model2, name: "Sedan", tag: "Conforto" },
  { img: model3, name: "SUV compacto", tag: "Versátil" },
];

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <SiteHeader />

      <HeroCinematic />

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                Estoque
              </h2>
            </div>
            <Link
              href="/estoque"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] hover:text-muted-foreground transition-colors"
            >
              Ver todo estoque <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((m) => (
              <Link
                key={m.name}
                href="/estoque"
                className="group cursor-pointer block"
                aria-label={`Ver ${m.name} no estoque`}
              >
                <div className="aspect-[4/3] overflow-hidden bg-card">
                  <img
                    src={m.img.src}
                    alt={m.name}
                    width={1280}
                    height={896}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {m.tag}
                  </p>
                  <h3 className="mt-2 text-xl font-light group-hover:text-muted-foreground transition-colors">
                    {m.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[80vh] overflow-hidden">
        <img
          src={racing.src}
          alt="Rodovia Veículos — tradição e compromisso"
          width={1600}
          height={900}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        <div className="relative z-10 mx-auto max-w-[1600px] px-6 lg:px-10 py-24 lg:py-32">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6">
            Nós. Inclui você.
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight max-w-3xl leading-[1.05]">
            Tradição construída sobre
            <br />
            <span className="italic font-extralight text-muted-foreground">
              princípios sólidos.
            </span>
          </h2>
          <p className="mt-8 max-w-xl text-muted-foreground leading-relaxed">
            Há 26 anos, a Rodovia Veículos cultiva relações duradouras com seus clientes — guiada
            por valores que definem cada negociação e cada entrega.
          </p>

          <ul className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10 max-w-5xl">
            {[
              { n: "01", label: "Respeito" },
              { n: "02", label: "Seriedade" },
              { n: "03", label: "Compromisso" },
              { n: "04", label: "Satisfação do cliente" },
              { n: "05", label: "Paz" },
            ].map((item, idx) => (
              <li
                key={item.n}
                className={`border-t border-border pt-5 ${
                  idx === 4 ? "col-span-2 md:col-span-1 text-center md:text-left" : ""
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
                  {item.n}
                </p>
                <p className="text-base md:text-lg font-light text-foreground leading-snug">
                  {item.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="avaliacao" className="py-24 lg:py-32 bg-card">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={avaliacao.src}
              alt="Avaliação profissional de veículo na Rodovia Veículos"
              width={1600}
              height={900}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">
              Avaliação do seu veículo
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
              Quer vender
              <br />
              ou trocar?
              <br />
              <span className="italic font-extralight text-muted-foreground">
                Avaliamos para você.
              </span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-lg">
              Receba uma proposta justa e transparente pelo seu veículo. Nossa equipe analisa
              modelo, ano e estado de conservação para oferecer o melhor valor de mercado.
            </p>
            <a
              href="https://wa.me/556199719187?text=Ol%C3%A1%21%20Gostaria%20de%20solicitar%20a%20avalia%C3%A7%C3%A3o%20do%20meu%20ve%C3%ADculo."
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-10 inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors"
            >
              Solicite sua avaliação
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Atendimento direto no WhatsApp
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
