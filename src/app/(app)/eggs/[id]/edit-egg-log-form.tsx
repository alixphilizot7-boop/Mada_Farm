"use client";

import { useActionState } from "react";
import { updateEggLogAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import { useI18n } from "@/components/i18n-provider";
import type { EggLog, Flock } from "@prisma/client";

export function EditEggLogForm({ log, flocks }: { log: EggLog; flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(updateEggLogAction, undefined);
  const { t } = useI18n();

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <input type="hidden" name="id" value={log.id} />
      <Field label={t.common.date}>
        <input name="date" type="date" required defaultValue={toDateInputValue(log.date)} className={inputClass} />
      </Field>
      <Field label={t.eggs.flock}>
        <select name="flockId" required defaultValue={log.flockId} className={inputClass}>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.eggs.form.wholeEggs}>
        <input name="wholeCount" type="number" min={0} required defaultValue={log.wholeCount} className={inputClass} />
      </Field>
      <Field label={t.eggs.form.brokenEggs}>
        <input name="brokenCount" type="number" min={0} defaultValue={log.brokenCount} className={inputClass} />
      </Field>
      <Field label={t.common.notes}>
        <input name="notes" defaultValue={log.notes ?? ""} className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.common.saveChanges}
        </Button>
      </div>
    </form>
  );
}
