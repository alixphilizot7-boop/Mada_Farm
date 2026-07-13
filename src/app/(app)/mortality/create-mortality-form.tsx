"use client";

import { useActionState } from "react";
import { createMortalityLogAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { Flock } from "@prisma/client";

export function CreateMortalityForm({ flocks }: { flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(createMortalityLogAction, undefined);
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
      <Field label={t.mortality.flock}>
        <select name="flockId" required className={inputClass}>
          <option value="">{t.mortality.selectFlock}</option>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name} ({flock.currentCount} {t.mortality.birds})
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.mortality.form.birdsLost}>
        <input name="quantity" type="number" min={1} required className={inputClass} />
      </Field>
      <Field label={t.mortality.form.cause}>
        <input name="cause" placeholder={t.mortality.form.causePlaceholder} className={inputClass} />
      </Field>
      <Field label={t.common.notes}>
        <input name="notes" className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" variant="danger" disabled={pending}>
          {pending ? t.common.saving : t.mortality.form.logLoss}
        </Button>
      </div>
    </form>
  );
}
