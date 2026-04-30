import { LanguageCodeFilterEnum } from "./__gen__/graphql";

export const localeToWpLanguage = {
  "pt-BR": LanguageCodeFilterEnum.Pt,
  "es-ES": LanguageCodeFilterEnum.Es, // Fallback to Pt as WP doesn't have ES
  "en-US": LanguageCodeFilterEnum.En,
  "de-DE": LanguageCodeFilterEnum.De,
  "it-IT": LanguageCodeFilterEnum.It,
  "fr-FR": LanguageCodeFilterEnum.Fr,
  "zh-CN": LanguageCodeFilterEnum.Zh,
} as const;

export type SupportedLocale = keyof typeof localeToWpLanguage;

export function resolveWpLanguage(
  locale?: string,
): (typeof localeToWpLanguage)[SupportedLocale] {
  if (!locale) {
    return localeToWpLanguage["pt-BR"];
  }

  return (
    localeToWpLanguage[locale as SupportedLocale] ?? localeToWpLanguage["pt-BR"]
  );
}
