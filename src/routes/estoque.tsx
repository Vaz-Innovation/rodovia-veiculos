import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import model1 from "@/assets/model-1.jpg";
import model2 from "@/assets/model-2.jpg";
import model3 from "@/assets/model-3.jpg";
import heroCar from "@/assets/hero-car.jpg";

export const Route = createFileRoute("/estoque")({
  head: () => ({
    meta: [
      { title: "Modelos — Vellora Motors" },
      { name: "description", content: "Conheça toda a gama de modelos Vellora: coupés, gran turismos e conversíveis." },
      { property: "og:title", content: "Modelos — Vellora Motors" },
      { property: "og:description", content: "A gama completa Vellora." },
      { property: "og:image", content: model1 },
    ],
  }),
  component: ModelosPage,
});

const models = [
  { img: heroCar, name: "F12 Stradale", category: "Coupé Esportivo", power: "720 cv", topSpeed: "340 km/h" },
  { img: model1, name: "Veneno Nero", category: "Hipercarro", power: "830 cv", topSpeed: "355 km/h" },
  { img: model2, name: "GT Lusso", category: "Grand Tourer", power: "612 cv", topSpeed: "320 km/h" },
  { img: model3, name: "Spyder R", category: "Conversível", power: "640 cv", topSpeed: "325 km/h" },
];

function ModelosPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-16 mx-auto max-w-[1600px] px-6 lg:px-10">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">A gama</p>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight">Modelos</h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Quatro silhuetas. Uma única filosofia: dirigir sem compromissos.
        </p>
      </section>

      <section className="pb-24 mx-auto max-w-[1600px] px-6 lg:px-10 space-y-24">
        {models.map((m, i) => (
          <article
            key={m.name}
            className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div className="aspect-[4/3] overflow-hidden bg-card">
              <img
                src={m.img}
                alt={m.name}
                width={1280}
                height={896}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{m.category}</p>
              <h2 className="mt-2 text-4xl md:text-5xl font-light">{m.name}</h2>
              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Potência</dt>
                  <dd className="mt-1 text-2xl font-light">{m.power}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Vel. máxima</dt>
                  <dd className="mt-1 text-2xl font-light">{m.topSpeed}</dd>
                </div>
              </dl>
              <button className="mt-8 inline-flex items-center gap-3 border border-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">
                Configurar
              </button>
            </div>
          </article>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}
