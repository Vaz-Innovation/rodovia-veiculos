"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand-logo";

export function ResetPasswordClient() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não conferem.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Senha redefinida com sucesso!");
    await supabase.auth.signOut();
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <BrandLogo size="lg" />
        </div>
        <h1 className="text-2xl font-light tracking-tight text-center mb-2">Redefinir senha</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Defina uma nova senha para sua conta administrativa.
        </p>

        {!ready ? (
          <p className="text-sm text-muted-foreground text-center">
            Validando link de recuperação...
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Nova senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground/40"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Confirmar senha
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-2 w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground/40"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-[0.25em] hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}

        <Link
          href="/admin"
          className="mt-6 block text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
