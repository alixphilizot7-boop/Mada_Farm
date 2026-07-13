"use client";

import { useActionState } from "react";
import { createFlockAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";

export function CreateFlockForm() {
  const [error, formAction, pending] = useActionState(createFlockAction, undefined);
  const { t } = useI18n();

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label={t.flocks.form.name}>
        <input name="name" required placeholder={t.flocks.form.namePlaceholder} className={inputClass} />
      </Field>
      <Field label={t.flocks.breed}>
        <input name="breed" placeholder={t.flocks.form.breedPlaceholder} className={inputClass} />
      </Field>
      <Field label={t.flocks.startDate}>
        <input name="startDate" type="date" required className={inputClass} />
      </Field>
      <Field label={t.flocks.form.initialCount}>
        <input name="initialCount" type="number" min={1} required className={inputClass} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label={t.common.notes}>
          <input name="notes" className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.flocks.form.creating : t.flocks.form.create}
        </Button>
      </div>
    </form>
  );
}
