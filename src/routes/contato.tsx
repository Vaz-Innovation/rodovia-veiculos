import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Vellora Motors" },
      { name: "description", content: "Fale com a Vellora Motors. Concessionárias, atendimento personalizado e configuração." },
      { property: "og:title", content: "Contato Vellora" },
      { property: "og:description", content: "Fale com nossos especialistas." },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-12 mx-auto max-w-[1600px] px-6 lg:px-10">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">Atendimento</p>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight">Contato</h1>
      </section>

      <section className="pb-24 mx-auto max-w-[1600px] px-6 lg:px-10 grid md:grid-cols-2 gap-16">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {[
            { id: "nome", label: "Nome", type: "text" },
            { id: "email", label: "E-mail", type: "email" },
            { id: "telefone", label: "Telefone", type: "tel" },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
                {f.label}
              </label>
              <input id={f.id} type={f.type} className="w-full bg-transparent border-b border-border py-3 focus:border-foreground outline-none transition-colors" />
            </div>
          ))}
          <div>
            <label htmlFor="msg" className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Mensagem
            </label>
            <textarea id="msg" rows={4} className="w-full bg-transparent border-b border-border py-3 focus:border-foreground outline-none resize-none" />
          </div>
          <button type="submit" className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors">
            Enviar
          </button>
        </form>

        <div className="space-y-10">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">Sede São Paulo</h3>
            <p className="text-sm leading-relaxed">
              Av. Brigadeiro Faria Lima, 3500<br />
              Itaim Bibi · São Paulo, SP<br />
              +55 11 4000-0000
            </p>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">Sede Rio de Janeiro</h3>
            <p className="text-sm leading-relaxed">
              Av. das Américas, 5000<br />
              Barra da Tijuca · Rio de Janeiro, RJ<br />
              +55 21 4000-0000
            </p>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">Atendimento</h3>
            <p className="text-sm">contato@velloramotors.com</p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
