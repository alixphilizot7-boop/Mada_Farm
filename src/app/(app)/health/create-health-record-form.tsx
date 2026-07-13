"use client";

import { useActionState } from "react";
import { createHealthRecordAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { VACCINATION_SCHEDULE } from "@/lib/vaccination-schedule";
import { useI18n } from "@/components/i18n-provider";
import type { Flock } from "@prisma/client";

export function CreateHealthRecordForm({ flocks }: { flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(createHealthRecordAction, undefined);
  const { t } = useI18n();

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label={t.common.date}>
        <input
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={inputClass}
        />
      </Field>
      <Field label={t.health.flock}>
        <select name="flockId" required className={inputClass}>
          <option value="">{t.health.selectFlock}</option>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.health.type}>
        <select name="type" defaultValue="ILLNESS" className={inputClass}>
          <option value="ILLNESS">{t.health.types.ILLNESS}</option>
          <option value="VACCINATION">{t.health.types.VACCINATION}</option>
          <option value="TREATMENT">{t.health.types.TREATMENT}</option>
          <option value="CHECKUP">{t.health.types.CHECKUP}</option>
        </select>
      </Field>
      <Field label={t.health.form.vaccinationType}>
        <select name="vaccinationType" defaultValue="" className={inputClass}>
          <option value="">{t.health.form.notFromSchedule}</option>
          {VACCINATION_SCHEDULE.map((rule) => (
            <option key={rule.name} value={rule.name}>
              {rule.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.health.form.birdsAffected}>
        <input name="affectedCount" type="number" min={0} defaultValue={0} className={inputClass} />
      </Field>
      <Field label={t.health.form.diagnosis}>
        <input name="diagnosis" className={inputClass} />
      </Field>
      <Field label={t.health.form.treatment}>
        <input name="treatment" className={inputClass} />
      </Field>
      <Field label={t.health.form.medicineUsed}>
        <input name="medicineUsed" className={inputClass} />
      </Field>
      <Field label={t.health.form.cost}>
        <input name="cost" type="number" min={0} step="any" defaultValue={0} className={inputClass} />
      </Field>
      <Field label={t.health.outcome}>
        <select name="outcome" defaultValue="ONGOING" className={inputClass}>
          <option value="RECOVERED">{t.health.outcomes.RECOVERED}</option>
          <option value="ONGOING">{t.health.outcomes.ONGOING}</option>
          <option value="DECEASED">{t.health.outcomes.DECEASED}</option>
        </select>
      </Field>
      <div className="sm:col-span-2 lg:col-span-3">
        <Field label={t.common.notes}>
          <input name="notes" className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.health.form.logRecord}
        </Button>
      </div>
    </form>
  );
}
