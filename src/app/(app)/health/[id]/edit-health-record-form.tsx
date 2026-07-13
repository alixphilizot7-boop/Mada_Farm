"use client";

import { useActionState } from "react";
import { updateHealthRecordAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import { VACCINATION_SCHEDULE } from "@/lib/vaccination-schedule";
import { useI18n } from "@/components/i18n-provider";
import type { Flock, HealthRecord } from "@prisma/client";

export function EditHealthRecordForm({ record, flocks }: { record: HealthRecord; flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(updateHealthRecordAction, undefined);
  const { t } = useI18n();

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="id" value={record.id} />
      <Field label={t.common.date}>
        <input name="date" type="date" required defaultValue={toDateInputValue(record.date)} className={inputClass} />
      </Field>
      <Field label={t.health.flock}>
        <select name="flockId" required defaultValue={record.flockId} className={inputClass}>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.health.type}>
        <select name="type" defaultValue={record.type} className={inputClass}>
          <option value="ILLNESS">{t.health.types.ILLNESS}</option>
          <option value="VACCINATION">{t.health.types.VACCINATION}</option>
          <option value="TREATMENT">{t.health.types.TREATMENT}</option>
          <option value="CHECKUP">{t.health.types.CHECKUP}</option>
        </select>
      </Field>
      <Field label={t.health.form.vaccinationType}>
        <select name="vaccinationType" defaultValue={record.vaccinationType ?? ""} className={inputClass}>
          <option value="">{t.health.form.notFromSchedule}</option>
          {VACCINATION_SCHEDULE.map((rule) => (
            <option key={rule.name} value={rule.name}>
              {rule.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.health.form.birdsAffected}>
        <input name="affectedCount" type="number" min={0} defaultValue={record.affectedCount} className={inputClass} />
      </Field>
      <Field label={t.health.form.diagnosis}>
        <input name="diagnosis" defaultValue={record.diagnosis ?? ""} className={inputClass} />
      </Field>
      <Field label={t.health.form.treatment}>
        <input name="treatment" defaultValue={record.treatment ?? ""} className={inputClass} />
      </Field>
      <Field label={t.health.form.medicineUsed}>
        <input name="medicineUsed" defaultValue={record.medicineUsed ?? ""} className={inputClass} />
      </Field>
      <Field label={t.health.form.cost}>
        <input name="cost" type="number" min={0} step="any" defaultValue={record.cost} className={inputClass} />
      </Field>
      <Field label={t.health.outcome}>
        <select name="outcome" defaultValue={record.outcome} className={inputClass}>
          <option value="RECOVERED">{t.health.outcomes.RECOVERED}</option>
          <option value="ONGOING">{t.health.outcomes.ONGOING}</option>
          <option value="DECEASED">{t.health.outcomes.DECEASED}</option>
        </select>
      </Field>
      <div className="sm:col-span-2 lg:col-span-3">
        <Field label={t.common.notes}>
          <input name="notes" defaultValue={record.notes ?? ""} className={inputClass} />
        </Field>
      </div>
      {record.outcome === "DECEASED" && (
        <p className="text-xs text-amber-600 dark:text-amber-400 sm:col-span-2 lg:col-span-4">
          {t.health.form.deceasedHint}
        </p>
      )}
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.common.saveChanges}
        </Button>
      </div>
    </form>
  );
}
