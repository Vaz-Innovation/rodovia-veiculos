"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Trash2, Star, StarOff, Upload } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import {
  COMMON_COLORS,
  COMMON_FEATURES,
  FUEL_LABELS,
  STATUS_LABELS,
  TRANSMISSION_LABELS,
  type FuelType,
  type TransmissionType,
  type Vehicle,
  type VehiclePhoto,
  type VehicleStatus,
} from "@/lib/vehicles";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

type VehicleWithPhotos = Vehicle & { vehicle_photos: VehiclePhoto[] };

interface FormState {
  brand: string;
  model: string;
  version: string;
  year_model: string;
  year_manufacture: string;
  price: string;
  mileage: string;
  transmission: TransmissionType;
  fuel: FuelType;
  color: string;
  doors: string;
  plate_end: string;
  description: string;
  features: string[];
  featured: boolean;
  status: VehicleStatus;
}

const empty: FormState = {
  brand: "",
  model: "",
  version: "",
  year_model: String(new Date().getFullYear()),
  year_manufacture: String(new Date().getFullYear()),
  price: "",
  mileage: "0",
  transmission: "manual",
  fuel: "flex",
  color: "",
  doors: "4",
  plate_end: "",
  description: "",
  features: [],
  featured: false,
  status: "disponivel",
};

export function VehicleFormClient({ id }: { id: string }) {
  const isNew = id === "novo";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(isNew ? null : id);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin", "vehicle", id],
    enabled: !isNew && !!user && isAdmin,
    queryFn: async (): Promise<VehicleWithPhotos | null> => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, vehicle_photos(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as VehicleWithPhotos | null;
    },
  });

  useEffect(() => {
    if (!existing) return;
    setForm({
      brand: existing.brand,
      model: existing.model,
      version: existing.version ?? "",
      year_model: String(existing.year_model),
      year_manufacture: String(existing.year_manufacture),
      price: String(existing.price),
      mileage: String(existing.mileage),
      transmission: existing.transmission,
      fuel: existing.fuel,
      color: existing.color,
      doors: existing.doors ? String(existing.doors) : "",
      plate_end: existing.plate_end ?? "",
      description: existing.description ?? "",
      features: existing.features,
      featured: existing.featured,
      status: existing.status,
    });
    setVehicleId(existing.id);
  }, [existing]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Carregando...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Acesso restrito.</p>
          <Link href="/admin" className="text-xs uppercase tracking-[0.2em] hover:text-foreground">
            Ir para login
          </Link>
        </div>
      </div>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      version: form.version.trim() || null,
      year_model: Number(form.year_model),
      year_manufacture: Number(form.year_manufacture),
      price: Number(form.price),
      mileage: Number(form.mileage),
      transmission: form.transmission,
      fuel: form.fuel,
      color: form.color.trim(),
      doors: form.doors ? Number(form.doors) : null,
      plate_end: form.plate_end.trim() || null,
      description: form.description.trim() || null,
      features: form.features,
      featured: form.featured,
      status: form.status,
    };

    const result =
      isNew || !vehicleId
        ? await supabase.from("vehicles").insert(payload).select().single()
        : await supabase.from("vehicles").update(payload).eq("id", vehicleId).select().single();

    setSaving(false);

    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    toast.success(isNew ? "Veículo criado" : "Alterações salvas");
    queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });

    if (isNew && result.data) {
      setVehicleId(result.data.id);
      router.replace(`/admin/veiculo/${result.data.id}`);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <BrandLogo size="sm" />
            <span className="text-[10px] uppercase tracking-[0.3em] border-l border-border pl-3">
              {isNew ? "Novo veículo" : "Editar veículo"}
            </span>
          </Link>
        </div>
      </header>

      {!isNew && isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Carregando...</div>
      ) : (
        <main className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10 grid lg:grid-cols-[1fr_360px] gap-10">
          <form onSubmit={submit} className="space-y-8">
            <Section title="Informações básicas">
              <Grid>
                <Field label="Marca" required>
                  <input
                    required
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Modelo" required>
                  <input
                    required
                    value={form.model}
                    onChange={(e) => set("model", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Versão">
                  <input
                    value={form.version}
                    onChange={(e) => set("version", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Cor" required>
                  <input
                    required
                    list="colors"
                    value={form.color}
                    onChange={(e) => set("color", e.target.value)}
                    className={inputCls}
                  />
                  <datalist id="colors">
                    {COMMON_COLORS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </Field>
              </Grid>
            </Section>

            <Section title="Especificações">
              <Grid>
                <Field label="Ano modelo" required>
                  <input
                    type="number"
                    required
                    value={form.year_model}
                    onChange={(e) => set("year_model", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Ano fabricação" required>
                  <input
                    type="number"
                    required
                    value={form.year_manufacture}
                    onChange={(e) => set("year_manufacture", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Quilometragem" required>
                  <input
                    type="number"
                    required
                    value={form.mileage}
                    onChange={(e) => set("mileage", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Preço (R$)" required>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Câmbio">
                  <select
                    value={form.transmission}
                    onChange={(e) => set("transmission", e.target.value as TransmissionType)}
                    className={inputCls}
                  >
                    {Object.entries(TRANSMISSION_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Combustível">
                  <select
                    value={form.fuel}
                    onChange={(e) => set("fuel", e.target.value as FuelType)}
                    className={inputCls}
                  >
                    {Object.entries(FUEL_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Portas">
                  <input
                    type="number"
                    min={2}
                    max={5}
                    value={form.doors}
                    onChange={(e) => set("doors", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Final de placa">
                  <input
                    value={form.plate_end}
                    onChange={(e) => set("plate_end", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </Grid>
            </Section>

            <Section title="Opcionais">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMMON_FEATURES.map((f) => {
                  const checked = form.features.includes(f);
                  return (
                    <label
                      key={f}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 border cursor-pointer text-sm",
                        checked
                          ? "border-foreground bg-accent"
                          : "border-border hover:border-foreground/40",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? form.features.filter((x) => x !== f)
                            : [...form.features, f];
                          set("features", next);
                        }}
                        className="accent-foreground"
                      />
                      <span>{f}</span>
                    </label>
                  );
                })}
              </div>
            </Section>

            <Section title="Descrição">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={6}
                placeholder="Detalhes adicionais, condições, garantia, etc."
                className={inputCls}
              />
            </Section>

            <div className="flex items-center justify-between gap-4 sticky bottom-0 bg-background border-t border-border py-4">
              <Link
                href="/admin"
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-[0.25em] hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? "Salvando..." : isNew ? "Criar veículo" : "Salvar alterações"}
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <Section title="Status e destaque">
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as VehicleStatus)}
                  className={inputCls}
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="mt-4 flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="accent-foreground"
                />
                <span>Veículo em destaque</span>
              </label>
            </Section>

            {vehicleId ? (
              <PhotoManager vehicleId={vehicleId} />
            ) : (
              <Section title="Fotos">
                <p className="text-sm text-muted-foreground">
                  Salve o veículo primeiro para enviar fotos.
                </p>
              </Section>
            )}
          </aside>
        </main>
      )}
    </div>
  );
}

function PhotoManager({ vehicleId }: { vehicleId: string }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: photos } = useQuery({
    queryKey: ["admin", "photos", vehicleId],
    queryFn: async (): Promise<VehiclePhoto[]> => {
      const { data, error } = await supabase
        .from("vehicle_photos")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "photos", vehicleId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const startPos = photos?.length ?? 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${vehicleId}/${Date.now()}-${i}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("vehicle-photos")
        .upload(path, file, { contentType: file.type });
      if (upErr) {
        toast.error(`Erro ao enviar ${file.name}: ${upErr.message}`);
        continue;
      }
      const { data: urlData } = supabase.storage.from("vehicle-photos").getPublicUrl(path);
      const isFirst = startPos === 0 && i === 0;
      await supabase.from("vehicle_photos").insert({
        vehicle_id: vehicleId,
        url: urlData.publicUrl,
        storage_path: path,
        position: startPos + i,
        is_cover: isFirst,
      });
    }

    setUploading(false);
    toast.success("Fotos enviadas");
    refresh();
  };

  const handleDelete = async (photo: VehiclePhoto) => {
    if (photo.storage_path) {
      await supabase.storage.from("vehicle-photos").remove([photo.storage_path]);
    }
    await supabase.from("vehicle_photos").delete().eq("id", photo.id);
    refresh();
  };

  const setCover = async (photo: VehiclePhoto) => {
    await supabase.from("vehicle_photos").update({ is_cover: false }).eq("vehicle_id", vehicleId);
    await supabase.from("vehicle_photos").update({ is_cover: true }).eq("id", photo.id);
    refresh();
  };

  return (
    <Section title="Fotos">
      <label
        className={cn(
          "flex flex-col items-center justify-center gap-2 border border-dashed border-border py-8 cursor-pointer hover:border-foreground/40",
          uploading && "opacity-60 pointer-events-none",
        )}
      >
        <Upload className="h-5 w-5 text-muted-foreground" />
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {uploading ? "Enviando..." : "Selecionar fotos"}
        </span>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </label>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {(photos ?? []).map((p) => (
          <div key={p.id} className="relative aspect-square bg-muted overflow-hidden group">
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            {p.is_cover && (
              <span className="absolute top-1 left-1 bg-foreground text-background text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5">
                Capa
              </span>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCover(p)}
                className="p-1.5 bg-background/90 hover:bg-background"
                title={p.is_cover ? "Já é capa" : "Definir como capa"}
              >
                {p.is_cover ? (
                  <StarOff className="h-3.5 w-3.5" />
                ) : (
                  <Star className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(p)}
                className="p-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/80"
                title="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

const inputCls =
  "w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/40";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card/30 border border-border p-6">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
