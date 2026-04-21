import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import universe from "@/assets/universe.jpg";
import model2 from "@/assets/model-2.jpg";
import model3 from "@/assets/model-3.jpg";

export const Route = createFileRoute("/localizacao")({
  head: () => ({
    meta: [
      { title: "Universo — Vellora Motors" },
      { name: "description", content: "Atelier de personalização, programa de proprietários e experiências exclusivas Vellora." },
      { property: "og:title", content: "Universo Vellora" },
      { property: "og:description", content: "Personalização e experiências." },
      { property: "og:image", content: universe },
    ],
  }),
  component: UniversoPage,
});

const pillars = [
  { img: universe, title: "Atelier", text: "Personalização sob medida com mais de 200 acabamentos artesanais." },
  { img: model2, title: "Owners Club", text: "Eventos exclusivos para proprietários em circuitos do mundo todo." },
  { img: model3, title: "Heritage", text: "O programa de restauração de modelos clássicos da marca." },
];

function UniversoPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-16 mx-auto max-w-[1600px] px-6 lg:px-10">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">Vellora</p>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight">Universo</h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Mais que automóveis: um estilo de vida construído em torno da
          excelência e da paixão por dirigir.
        </p>
      </section>

      <section className="pb-24 mx-auto max-w-[1600px] px-6 lg:px-10 grid md:grid-cols-3 gap-6">
        {pillars.map((p) => (
          <article key={p.title} className="group">
            <div className="aspect-[4/5] overflow-hidden bg-card">
              <img src={p.img} alt={p.title} width={1280} height={1600} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <h3 className="mt-5 text-2xl font-light">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}
