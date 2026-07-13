"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { LOCALE_COOKIE } from "@/lib/i18n/cookie";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale } = useI18n();
  const router = useRouter();

  function toggle() {
    const next = locale === "fr" ? "en" : "fr";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      className={
        className ??
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
      }
      title={locale === "fr" ? "Switch to English" : "Passer en français"}
    >
      <Languages className="h-3.5 w-3.5" />
      {locale === "fr" ? "FR" : "EN"}
    </button>
  );
}
