import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border text-foreground">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-20 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
        <div className="md:col-span-6">
          <BrandLogo size="lg" />
          <p className="mt-8 text-sm text-muted-foreground leading-relaxed max-w-sm">
            Trabalho em equipe e dedicação ao cliente: transformando qualidade em tradição há 26 anos.
          </p>
        </div>
        <div className="md:col-span-3 md:pt-3">
          <h4 className="text-[11px] uppercase tracking-[0.25em] text-foreground mb-5">Marca</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link to="/estoque" className="hover:text-foreground transition-colors">Estoque</Link></li>
            <li><Link to="/delivery" className="hover:text-foreground transition-colors">Delivery</Link></li>
            <li><Link to="/localizacao" className="hover:text-foreground transition-colors">Localização</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3 md:pt-3">
          <h4 className="text-[11px] uppercase tracking-[0.25em] text-foreground mb-5">Atendimento</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link to="/contato" className="hover:text-foreground transition-colors">Contato</Link></li>
            <li><Link to="/localizacao" className="hover:text-foreground transition-colors">Como chegar</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-6 flex flex-col md:flex-row justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <p>© {new Date().getFullYear()} Rodovia Veículos. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacidade</a>
            <a href="#" className="hover:text-foreground">Termos</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
