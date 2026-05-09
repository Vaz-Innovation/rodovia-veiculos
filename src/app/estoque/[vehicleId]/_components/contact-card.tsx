import { useState, type FormEvent } from "react";
import { MessageCircle, Phone } from "lucide-react";
import type { Vehicle, VehiclePhoto } from "@/lib/vehicles";

type VehicleWithPhotos = Vehicle & { vehicle_photos: VehiclePhoto[] };

export function ContactCard({ vehicle }: { vehicle: VehicleWithPhotos }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [complement, setComplement] = useState("");

  function maskPhone(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/^([0-9]{2})([0-9])/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  }

  const fixedMessage = `Olá! Tenho interesse no veículo ${vehicle.name} #${vehicle.id}. Aguardo retorno.`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `${fixedMessage}${complement ? "\n" + complement : ""}\n\nNome: ${name}${phone ? `\nTelefone: ${phone}` : ""}`,
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
          placeholder="Seu nome *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40"
        />
        <input
          type="tel"
          placeholder="Seu telefone (opcional)"
          value={phone}
          maxLength={15}
          onChange={(e) => setPhone(maskPhone(e.target.value))}
          className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40"
        />
        <div>
          <div className="w-full bg-muted border border-border px-3 py-2.5 text-sm text-muted-foreground/70 rounded mb-2 select-text">
            {fixedMessage}
          </div>
          <textarea
            rows={3}
            placeholder="Mensagem adicional (opcional)"
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40"
          />
        </div>
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
