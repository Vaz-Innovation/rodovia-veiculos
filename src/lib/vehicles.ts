import type { Database } from "@/integrations/supabase/types";

export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type VehiclePhoto = Database["public"]["Tables"]["vehicle_photos"]["Row"];
export type TransmissionType = Database["public"]["Enums"]["transmission_type"];
export type FuelType = Database["public"]["Enums"]["fuel_type"];
export type VehicleStatus = Database["public"]["Enums"]["vehicle_status"];

export const TRANSMISSION_LABELS: Record<TransmissionType, string> = {
  manual: "Manual",
  automatico: "Automático",
  cvt: "CVT",
  automatizado: "Automatizado",
};

export const FUEL_LABELS: Record<FuelType, string> = {
  flex: "Flex",
  gasolina: "Gasolina",
  diesel: "Diesel",
  hibrido: "Híbrido",
  eletrico: "Elétrico",
  gnv: "GNV",
};

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  disponivel: "Disponível",
  vendido: "Vendido",
  reservado: "Reservado",
};

export const COMMON_FEATURES = [
  "Ar-condicionado",
  "Direção elétrica",
  "Vidros elétricos",
  "Travas elétricas",
  "Airbag",
  "ABS",
  "Multimídia",
  "Câmera de ré",
  "Sensor de estacionamento",
  "Computador de bordo",
  "Bancos em couro",
  "Rodas de liga leve",
  "Faróis de LED",
  "Piloto automático",
  "Start/Stop",
  "Teto solar",
] as const;

export const COMMON_COLORS = [
  "Branco",
  "Prata",
  "Preto",
  "Cinza",
  "Vermelho",
  "Azul",
  "Marrom",
  "Bege",
  "Verde",
];

export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function formatMileage(km: number): string {
  return `${km.toLocaleString("pt-BR")} km`;
}

export function vehicleTitle(v: Pick<Vehicle, "brand" | "model" | "version">): string {
  return [v.brand, v.model, v.version].filter(Boolean).join(" ");
}

export function whatsappLink(v: Pick<Vehicle, "brand" | "model" | "year_model">) {
  const text = encodeURIComponent(
    `Olá! Tenho interesse no ${v.brand} ${v.model} ${v.year_model} anunciado no site da Rodovia Veículos.`,
  );
  return `https://wa.me/556199719187?text=${text}`;
}
