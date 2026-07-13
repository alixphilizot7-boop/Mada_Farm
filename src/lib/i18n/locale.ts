import { cookies } from "next/headers";
import { dictionaries, type Locale } from "./dictionary";
import { LOCALE_COOKIE } from "./cookie";

export const DEFAULT_LOCALE: Locale = "fr";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" || value === "fr" ? value : DEFAULT_LOCALE;
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
