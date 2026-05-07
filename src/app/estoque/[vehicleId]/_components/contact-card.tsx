import { useState, type FormEvent } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle, VehiclePhoto } from "@/lib/vehicles";

type VehicleWithPhotos = Vehicle & { vehicle_photos: VehiclePhoto[] };

export function ContactCard({ vehicle }: { vehicle: VehicleWithPhotos }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year_model}. Aguardo retorno.`,
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `${message}\n\nNome: ${name}${phone ? `\nTelefone: ${phone}` : ""}`,
    );
    window.open(`https://wa.me/556199719187?text=${text}`, "_blank", "noopener");
  };

  return (
    <div className="bg-card border border-border p-6">
      <h3 className="text-sm font-medium text-foreground mb-1">Envie uma mensagem ao vendedor</h3>
      <p className="text-xs text-muted-foreground mb-5">Resposta direta pelo WhatsApp.</p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Nome*"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40"
        />
        <input
          type="tel"
          placeholder="Telefone (opcional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40"
        />
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/40 resize-none"
        />
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90"
        >
          <MessageCircle className="h-4 w-4" />
          Enviar via WhatsApp
        </button>
      </form>
      <a
        href="tel:+556199719187"
        className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-border text-foreground px-5 py-3 text-sm font-medium hover:bg-card"
      >
        <Phone className="h-4 w-4" /> (61) 99971-9187
      </a>
    </div>
  );
}
