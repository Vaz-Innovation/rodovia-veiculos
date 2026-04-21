import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja Oficial — Vellora Motors" },
      { name: "description", content: "Coleção lifestyle Vellora: vestuário, acessórios e edições limitadas." },
      { property: "og:title", content: "Loja Vellora" },
      { property: "og:description", content: "Lifestyle e edições limitadas." },
    ],
  }),
  component: LojaPage,
});

const products = [
  { name: "Jaqueta Pista", price: "R$ 4.290", category: "Vestuário" },
  { name: "Boné Heritage", price: "R$ 590", category: "Acessórios" },
  { name: "Carteira Couro", price: "R$ 1.890", category: "Acessórios" },
  { name: "Camiseta Corse", price: "R$ 690", category: "Vestuário" },
  { name: "Cronógrafo Edição", price: "R$ 18.900", category: "Edição Limitada" },
  { name: "Mala Cabine", price: "R$ 7.450", category: "Viagem" },
];

function LojaPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-12 mx-auto max-w-[1600px] px-6 lg:px-10">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">Coleção</p>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight">Loja</h1>
      </section>

      <section className="pb-24 mx-auto max-w-[1600px] px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <article key={p.name} className="group cursor-pointer">
            <div className="aspect-square bg-card flex items-center justify-center overflow-hidden">
              <span className="text-muted-foreground text-xs uppercase tracking-[0.3em]">{p.category}</span>
            </div>
            <div className="mt-4 flex justify-between">
              <h3 className="text-sm font-light">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.price}</p>
            </div>
          </article>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}
