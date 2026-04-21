import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-rodovia.png";

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border text-foreground">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <img src={logo} alt="Rodovia Veículos" className="h-10 w-auto object-contain" />
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed max-w-xs">
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
          <h4 className="text-xs uppercase tracking-[0.2em] text-foreground mb-4">Serviços</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/contato" className="hover:text-foreground">Concessionárias</Link></li>
            <li><Link to="/contato" className="hover:text-foreground">Pós-venda</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-foreground mb-4">Newsletter</h4>
          <p className="text-xs text-muted-foreground mb-3">Receba notícias exclusivas.</p>
          <form className="flex border-b border-border">
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 bg-transparent text-xs py-2 placeholder:text-muted-foreground focus:outline-none"
            />
            <button type="submit" className="text-xs uppercase tracking-[0.2em] text-foreground">
              Enviar
            </button>
          </form>
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
