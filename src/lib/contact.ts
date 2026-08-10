/**
 * Single source of truth for the company's contact information.
 * Any phone, WhatsApp, address, hours or social link shown on the site
 * must come from here — never hardcode these values in components/pages.
 */

export const BUSINESS_NAME = "Rodovia Veículos";

const PHONE_DIGITS = "556133872700";

export const PHONE = {
  display: "(61) 3387-2700",
  e164: `+${PHONE_DIGITS}`,
  tel: `tel:+${PHONE_DIGITS}`,
} as const;

export const WHATSAPP = {
  display: PHONE.display,
  number: PHONE_DIGITS,
  url: `https://wa.me/${PHONE_DIGITS}`,
} as const;

export function whatsappUrl(message?: string): string {
  return message ? `${WHATSAPP.url}?text=${encodeURIComponent(message)}` : WHATSAPP.url;
}

export const ADDRESS = {
  line1: "Quadra 6, CL 03 — Loja 03",
  line2: "Sobradinho, Brasília — DF · CEP 73.026-510",
  locality: "Sobradinho",
  state: "DF",
  country: "BR",
  city: "Brasília",
  short: "Sobradinho, Brasília — DF",
} as const;

export const MAPS_URL =
  "https://www.google.com/maps/place/Rodovia+Ve%C3%ADculos/@-15.6521107,-47.8025031,17z/data=!3m1!4b1!4m6!3m5!1s0x935a3f81c27911c1:0x5db2f04c15726fcf!8m2!3d-15.6521107!4d-47.8025031!16s%2Fg%2F11b6r_wt_1?entry=ttu";

export const MAPS_EMBED_URL =
  "https://www.google.com/maps?q=-15.6521107,-47.8025031&hl=pt-BR&z=17&output=embed";

export const OPENING_HOURS = [
  { label: "Seg — Sex", value: "08h — 19h" },
  { label: "Sábado", value: "08h — 16h" },
  { label: "Domingo", value: "Fechado" },
] as const;

export const SOCIAL = {
  instagram: {
    handle: "@rodovia.veiculos",
    url: "https://instagram.com/rodovia.veiculos/",
  },
  facebook: {
    handle: BUSINESS_NAME,
    url: "https://www.facebook.com/rodoviaveiculosltda/",
  },
} as const;
