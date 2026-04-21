import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border text-foreground">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-3 gap-10">
        <div>
          <BrandLogo size="lg" />
          <p className="mt-6 text-xs text-muted-foreground leading-relaxed max-w-xs">
            Seu próximo veículo está aqui. Estoque selecionado, delivery e atendimento dedicado.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-foreground mb-4">Marca</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/estoque" className="hover:text-foreground">Estoque</Link></li>
            <li><Link to="/delivery" className="hover:text-foreground">Delivery</Link></li>
            <li><Link to="/localizacao" className="hover:text-foreground">Localização</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-foreground mb-4">Atendimento</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/contato" className="hover:text-foreground">Contato</Link></li>
            <li><Link to="/localizacao" className="hover:text-foreground">Como chegar</Link></li>
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
