export type TransmissionType = "manual" | "automatico" | "cvt" | "automatizado";
export type FuelType = "flex" | "gasolina" | "diesel" | "hibrido" | "eletrico" | "gnv";
export type VehicleStatus = "disponivel" | "vendido" | "reservado";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  year_model: number;
  year_manufacture: number;
  price: number;
  mileage: number;
  transmission: TransmissionType;
  fuel: FuelType;
  color: string;
  doors: number | null;
  plate_end: string | null;
  description: string | null;
  features: string[];
  featured: boolean;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
  name?: string | null;
}

export interface VehiclePhoto {
  id: string;
  vehicle_id: string;
  url: string;
  storage_path: string | null;
  position: number;
  is_cover: boolean;
  created_at: string;
}

export type VehicleWithPhoto = Vehicle & { vehicle_photos: VehiclePhoto[] };

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
