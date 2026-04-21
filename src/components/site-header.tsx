import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";


const navLinks = [
  { to: "/estoque", label: "Estoque" },
  { to: "/delivery", label: "Delivery" },
  { to: "/localizacao", label: "Localização" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || open
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-background/70 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 h-24 grid grid-cols-[1fr_auto_1fr] items-center">
        <Link
          to="/"
          className="flex items-center text-foreground justify-self-start"
          aria-label="Rodovia Veículos — Página inicial"
        >
          <BrandLogo size="lg" />
        </Link>

        <nav className="hidden lg:flex items-center gap-12 justify-self-center">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[11px] uppercase tracking-[0.3em] text-foreground/75 hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="lg:hidden text-foreground"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-[1600px] px-6 py-6 flex flex-col gap-5">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
