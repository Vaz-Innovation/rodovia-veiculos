import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroCar from "@/assets/hero-car.jpg";
import model1 from "@/assets/model-1.jpg";
import model2 from "@/assets/model-2.jpg";
import model3 from "@/assets/model-3.jpg";
import racing from "@/assets/racing.jpg";
import universe from "@/assets/universe.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vellora Motors — Engenharia, Design e Performance" },
      {
        name: "description",
        content:
          "Vellora Motors. Carros esportivos de luxo, edições limitadas, herança em corridas e a mais avançada engenharia italiana.",
      },
      { property: "og:title", content: "Vellora Motors" },
      { property: "og:description", content: "Carros esportivos de luxo." },
      { property: "og:image", content: heroCar },
      { name: "twitter:image", content: heroCar },
    ],
  }),
  component: HomePage,
});

const featured = [
  { img: model1, name: "Vellora F12 Stradale", tag: "Coupé" },
  { img: model2, name: "Vellora GT Lusso", tag: "Grand Tourer" },
  { img: model3, name: "Vellora Spyder R", tag: "Conversível" },
];

function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
        <img
          src={heroCar}
          alt="Vellora F12 Stradale em estúdio"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="relative z-10 mx-auto max-w-[1600px] h-full px-6 lg:px-10 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] uppercase tracking-[0.5em] text-foreground/80 mb-6 pl-[0.5em]">
            Sem custo · Sem compromisso
          </p>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[0.95] text-foreground">
            <span className="italic font-extralight">Delivery</span>
          </h1>
          <div className="mt-8 h-px w-16 bg-foreground/40" />
          <p className="mt-8 max-w-xl text-base md:text-lg text-foreground/85 leading-relaxed">
            Gostou de um modelo? Nós levamos o carro até sua casa ou trabalho para um test-drive.
          </p>
          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <Link
              to="/delivery"
              className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors"
            >
              Quero meu test-drive
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/estoque"
              className="inline-flex items-center gap-3 border border-foreground/50 px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-foreground hover:text-background transition-colors"
            >
              Ver estoque
            </Link>
          </div>
        </div>
      </section>

      {/* MODELOS EM DESTAQUE */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">
                A coleção
              </p>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                Modelos em destaque
              </h2>
            </div>
            <Link
              to="/estoque"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] hover:text-muted-foreground transition-colors"
            >
              Ver toda a gama <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((m) => (
              <article key={m.name} className="group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden bg-card">
                  <img
                    src={m.img}
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
                  <h3 className="mt-2 text-xl font-light">{m.name}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ESPORTES */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        <img
          src={racing}
          alt="Vellora Corse na pista"
          width={1600}
          height={900}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
        <div className="relative z-10 mx-auto max-w-[1600px] h-full px-6 lg:px-10 flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">
            Vellora Corse
          </p>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight max-w-2xl">
            Nascidos na pista. Forjados em vitórias.
          </h2>
          <p className="mt-6 max-w-lg text-muted-foreground">
            Décadas de competição traduzidas em cada componente que sai da
            nossa linha de montagem.
          </p>
          <Link
            to="/delivery"
            className="mt-10 inline-flex w-fit items-center gap-3 border border-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
          >
            Conhecer a equipe <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* AVALIAÇÃO DO VEÍCULO */}
      <section className="py-24 lg:py-32 bg-card">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={universe}
              alt="Avaliação de veículo na Rodovia Veículos"
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
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">
              Quer vender ou trocar? <span className="italic font-extralight">Avaliamos para você.</span>
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
