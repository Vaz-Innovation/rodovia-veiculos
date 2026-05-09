import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function NotFoundView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-light">Veículo não encontrado</h1>
        <Link
          href="/estoque"
          className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao estoque
        </Link>
      </div>
    </div>
  );
}
