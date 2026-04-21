import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import racing from "@/assets/racing.jpg";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Esportes — Vellora Corse" },
      { name: "description", content: "Vellora Corse: a divisão de competição da marca, da Fórmula às pistas de endurance." },
      { property: "og:title", content: "Vellora Corse" },
      { property: "og:description", content: "Décadas de competição." },
      { property: "og:image", content: racing },
    ],
  }),
  component: EsportesPage,
});

const titles = [
  { year: "2024", event: "WEC Endurance", result: "Campeões" },
  { year: "2023", event: "GT World Challenge", result: "1º Lugar" },
  { year: "2022", event: "Le Mans 24h", result: "Pódio" },
  { year: "2021", event: "DTM", result: "Vice-campeões" },
];

function EsportesPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteHeader />
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img src={racing} alt="Vellora Corse" width={1600} height={900} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/30" />
        <div className="relative z-10 mx-auto max-w-[1600px] h-full px-6 lg:px-10 flex flex-col justify-end pb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">Vellora Corse</p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight">Esportes</h1>
        </div>
      </section>

      <section className="py-24 mx-auto max-w-[1600px] px-6 lg:px-10 grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight">Uma herança em movimento</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Desde a primeira vitória em 1967 até as 24 Horas de Le Mans, a Vellora
          Corse forjou o DNA da marca. Cada modelo de rua carrega a tecnologia
          desenvolvida em pista — porque para nós, competir é a forma mais pura
          de evoluir.
        </p>
      </section>

      <section className="pb-24 mx-auto max-w-[1600px] px-6 lg:px-10">
        <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">Conquistas recentes</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-border">
          {titles.map((t) => (
            <div key={t.year} className="border-b border-r border-border last:border-r-0 lg:border-b-0 p-8">
              <p className="text-4xl font-light">{t.year}</p>
              <p className="mt-3 text-sm text-muted-foreground">{t.event}</p>
              <p className="mt-1 text-sm">{t.result}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
