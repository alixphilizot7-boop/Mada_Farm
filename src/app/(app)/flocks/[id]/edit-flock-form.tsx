"use client";

import { useActionState } from "react";
import { updateFlockAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { Flock } from "@prisma/client";

export function EditFlockForm({ flock }: { flock: Flock }) {
  const [error, formAction, pending] = useActionState(updateFlockAction, undefined);
  const { t } = useI18n();

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={flock.id} />
      <Field label={t.flocks.form.name}>
        <input name="name" defaultValue={flock.name} required className={inputClass} />
      </Field>
      <Field label={t.flocks.breed}>
        <input name="breed" defaultValue={flock.breed ?? ""} className={inputClass} />
      </Field>
      <Field label={t.common.status}>
        <select name="status" defaultValue={flock.status} className={inputClass}>
          <option value="ACTIVE">{t.flocks.statusActive}</option>
          <option value="SOLD_OUT">{t.flocks.statusSoldOut}</option>
          <option value="CLOSED">{t.flocks.statusClosed}</option>
        </select>
      </Field>
      <Field label={t.common.notes}>
        <input name="notes" defaultValue={flock.notes ?? ""} className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.common.saveChanges}
        </Button>
      </div>
    </form>
  );
}
