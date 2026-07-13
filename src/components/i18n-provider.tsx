"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale, Dictionary } from "@/lib/i18n/dictionary";

const I18nContext = createContext<{ locale: Locale; t: Dictionary } | null>(null);

export function I18nProvider({
  locale,
  t,
  children,
}: {
  locale: Locale;
  t: Dictionary;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
