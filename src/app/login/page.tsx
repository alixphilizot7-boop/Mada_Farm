"use client";

import { useActionState } from "react";
import { Sprout } from "lucide-react";
import { loginAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/components/i18n-provider";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 via-stone-50 to-emerald-50 px-4 dark:from-stone-950 dark:via-stone-950 dark:to-emerald-950">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-stone-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(87,68,32,0.04),0_20px_40px_-16px_rgba(87,68,32,0.25)] dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-col items-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <Sprout className="h-7 w-7" />
          </span>
          <h1 className="font-heading text-2xl font-semibold text-emerald-800 dark:text-emerald-400">
            {t.login.title}
          </h1>
          <p className="mt-1 text-center text-sm text-stone-500 dark:text-stone-400">{t.login.subtitle}</p>
        </div>
        <form action={formAction} className="mt-6 space-y-4">
          <Field label={t.login.email}>
            <input name="email" type="email" required className={inputClass} autoFocus />
          </Field>
          <Field label={t.login.password}>
            <input name="password" type="password" required className={inputClass} />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.login.signingIn : t.login.signIn}
          </Button>
        </form>
      </div>
    </div>
  );
}
