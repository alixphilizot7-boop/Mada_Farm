"use client";

import { useActionState } from "react";
import { createEggLogAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { Flock } from "@prisma/client";

export function CreateEggLogForm({ flocks }: { flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(createEggLogAction, undefined);
  const { t } = useI18n();

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Field label={t.common.date}>
        <input
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={inputClass}
        />
      </Field>
      <Field label={t.eggs.flock}>
        <select name="flockId" required className={inputClass}>
          <option value="">{t.eggs.selectFlock}</option>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.eggs.form.wholeEggs}>
        <input name="wholeCount" type="number" min={0} required className={inputClass} />
      </Field>
      <Field label={t.eggs.form.brokenEggs}>
        <input name="brokenCount" type="number" min={0} defaultValue={0} className={inputClass} />
      </Field>
      <Field label={t.common.notes}>
        <input name="notes" className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.eggs.form.logEggs}
        </Button>
      </div>
    </form>
  );
}
