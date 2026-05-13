export type TransmissionType = "Manual" | "Automatico" | "CVT" | "Automatizado";
export type FuelType = "Flex" | "Gasolina" | "Diesel" | "Hibrido" | "Eletrico" | "GNV";
export type VehicleStatus = "disponivel" | "vendido" | "reservado";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  description: string | null;
  year_model: number;
  year_manufacture: number;
  price: number;
  mileage: number;
  transmission: TransmissionType;
  fuel: FuelType;
  color: string;
  doors: number | null;
  plate_end: string | null;
  categories: string[];
  tags: string[] | null;
  featured: boolean;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
  name?: string | null;
  city?: string | null;
  district?: string | null;
  engine?: string | null;
  condition?: string | null;
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
  Manual: "Manual",
  Automatico: "Automático",
  CVT: "CVT",
  Automatizado: "Automatizado",
};

export const FUEL_LABELS: Record<FuelType, string> = {
  Flex: "Flex",
  Gasolina: "Gasolina",
  Diesel: "Diesel",
  Hibrido: "Híbrido",
  Eletrico: "Elétrico",
  GNV: "GNV",
};

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  disponivel: "Disponível",
  vendido: "Vendido",
  reservado: "Reservado",
};

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

export const COMMON_CONDITIONS = ["NOVO", "USADO", "SEMI-NOVO"];

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
