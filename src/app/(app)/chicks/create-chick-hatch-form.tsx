"use client";

import { useActionState } from "react";
import { createChickHatchAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { Flock } from "@prisma/client";

export function CreateChickHatchForm({ flocks }: { flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(createChickHatchAction, undefined);
  const { t } = useI18n();

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Field label={t.chicks.form.hatchDate}>
        <input
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={inputClass}
        />
      </Field>
      <Field label={t.chicks.form.eggsSet}>
        <input name="eggsSet" type="number" min={1} required className={inputClass} />
      </Field>
      <Field label={t.chicks.form.chicksHatched}>
        <input name="chicksHatched" type="number" min={0} required className={inputClass} />
      </Field>
      <Field label={t.chicks.form.addToFlock}>
        <select name="flockId" className={inputClass}>
          <option value="">{t.chicks.form.newBatch}</option>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.common.notes}>
        <input name="notes" className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.chicks.form.logHatch}
        </Button>
      </div>
    </form>
  );
}
