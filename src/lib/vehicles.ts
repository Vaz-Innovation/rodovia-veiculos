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
  transmission: string;
  fuel: string;
  color: string;
  doors: number | null;
  plate_end: string | null;
  categories: string[];
  tags: string[] | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
  name?: string | null;
  city?: string | null;
  district?: string | null;
  engine?: string | null;
  condition?: string | null;
  photos?: string[];
}

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

export const TRANSMISSION_OPTIONS: Record<string, string> = {
  automatico: "Automático",
  manual: "Manual",
  cvt: "CVT",
  automatizado: "Automatizado",
};

export const FUEL_OPTIONS: Record<string, string> = {
  flex: "Flex",
  gasolina: "Gasolina",
  etanol: "Etanol",
  diesel: "Diesel",
  eletrico: "Elétrico",
  hibrido: "Híbrido",
  gnv: "GNV",
};

export const COLOR_OPTIONS: Record<string, string> = {
  branco: "Branco",
  preto: "Preto",
  prata: "Prata",
  cinza: "Cinza",
  vermelho: "Vermelho",
  azul: "Azul",
  verde: "Verde",
  amarelo: "Amarelo",
  laranja: "Laranja",
  marrom: "Marrom",
  bege: "Bege",
  vinho: "Vinho",
  champagne: "Champagne",
};

export const CONDITION_OPTIONS: Record<string, string> = {
  novo: "Novo",
  semi_novo: "Semi-novo",
  usado: "Usado",
};
