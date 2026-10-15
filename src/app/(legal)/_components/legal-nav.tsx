"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { to: "/privacidade", label: "Privacidade" },
  { to: "/termos", label: "Termos de serviço" },
  { to: "/cookies", label: "Cookies" },
] as const;

export function LegalNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentos legais" className="flex flex-wrap gap-x-8 gap-y-3">
      {links.map(({ to, label }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            href={to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-b pb-2 text-[11px] uppercase tracking-[0.25em] transition-colors",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
