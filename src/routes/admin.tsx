import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, LogOut, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import {
  STATUS_LABELS,
  formatPrice,
  vehicleTitle,
  type Vehicle,
  type VehiclePhoto,
} from "@/lib/vehicles";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Rodovia Veículos" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type VehicleWithPhotos = Vehicle & { vehicle_photos: VehiclePhoto[] };

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  if (!isAdmin) return <NotAdminScreen />;
  return <AdminDashboard />;
}

function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setSubmitting(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Enviamos um e-mail com o link de redefinição.");
      setMode("login");
      return;
    }
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setSubmitting(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Conta criada! Você já pode entrar.");
      setMode("login");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) toast.error(error.message);
  };

  const title =
    mode === "forgot"
      ? "Recuperar senha"
      : mode === "signup"
        ? "Criar conta admin"
        : "Acesso administrativo";

  const subtitle =
    mode === "forgot"
      ? "Informe seu e-mail e enviaremos um link para redefinir sua senha."
      : mode === "signup"
        ? "Cadastre-se para gerenciar o estoque."
        : "Entre com sua conta para gerenciar o estoque.";

  const cta =
    mode === "forgot"
      ? submitting
        ? "Enviando..."
        : "Enviar link"
      : mode === "signup"
        ? submitting
          ? "Cadastrando..."
          : "Criar conta"
        : submitting
          ? "Entrando..."
          : "Entrar";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <BrandLogo size="lg" />
        </div>
        <h1 className="text-2xl font-light tracking-tight text-center mb-2">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          {subtitle}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground/40"
            />
          </div>
          {mode !== "forgot" && (
            <div>
              <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground/40"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-[0.25em] hover:bg-primary/90 disabled:opacity-60"
          >
            {cta}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 items-center">
          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                Esqueci minha senha
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                Primeiro acesso? Criar conta admin
              </button>
            </>
          )}
          {mode !== "login" && (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Voltar ao login
            </button>
          )}
        </div>

        {mode === "signup" && (
          <p className="mt-4 text-[11px] text-center text-muted-foreground">
            A primeira conta criada se torna administradora automaticamente.
          </p>
        )}
      </div>
    </div>
  );
}

function NotAdminScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-light mb-3">Acesso negado</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sua conta não tem permissão de administrador. Solicite acesso ao gestor do site.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs uppercase tracking-[0.2em] hover:text-muted-foreground inline-flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: async (): Promise<VehicleWithPhotos[]> => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, vehicle_photos(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VehicleWithPhotos[];
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este veículo? Esta ação não pode ser desfeita.")) return;

    // delete storage files first
    const { data: photos } = await supabase
      .from("vehicle_photos")
      .select("storage_path")
      .eq("vehicle_id", id);
    const paths = (photos ?? []).map((p) => p.storage_path).filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("vehicle-photos").remove(paths);

    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Veículo excluído");
    queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-l border-border pl-3">
              Painel admin
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Link
              to="/estoque"
              className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <Eye className="h-3.5 w-3.5" /> Ver site
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 lg:px-10 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Estoque</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? "Carregando..." : `${data?.length ?? 0} veículos cadastrados`}
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/admin/veiculo/$id", params: { id: "novo" } })}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Novo veículo
          </button>
        </div>

        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4">Foto</th>
                <th className="py-3 px-4">Veículo</th>
                <th className="py-3 px-4">Ano</th>
                <th className="py-3 px-4">Km</th>
                <th className="py-3 px-4">Preço</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((v) => {
                const cover =
                  v.vehicle_photos.find((p) => p.is_cover) ??
                  [...v.vehicle_photos].sort((a, b) => a.position - b.position)[0];
                return (
                  <tr key={v.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <div className="w-16 h-12 bg-muted overflow-hidden">
                        {cover && (
                          <img
                            src={cover.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{vehicleTitle(v)}</p>
                      <p className="text-xs text-muted-foreground">{v.color}</p>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{v.year_model}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {v.mileage.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 px-4">{formatPrice(Number(v.price))}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {STATUS_LABELS[v.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to="/admin/veiculo/$id"
                          params={{ id: v.id }}
                          className="p-2 hover:bg-accent"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-2 hover:bg-destructive/10 text-destructive"
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(data ?? []).length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    Nenhum veículo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
