"use client";

import { useActionState } from "react";
import { updateHealthRecordAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import { VACCINATION_SCHEDULE } from "@/lib/vaccination-schedule";
import type { Flock, HealthRecord } from "@prisma/client";

export function EditHealthRecordForm({ record, flocks }: { record: HealthRecord; flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(updateHealthRecordAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="id" value={record.id} />
      <Field label="Date">
        <input name="date" type="date" required defaultValue={toDateInputValue(record.date)} className={inputClass} />
      </Field>
      <Field label="Flock">
        <select name="flockId" required defaultValue={record.flockId} className={inputClass}>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Type">
        <select name="type" defaultValue={record.type} className={inputClass}>
          <option value="ILLNESS">Illness</option>
          <option value="VACCINATION">Vaccination</option>
          <option value="TREATMENT">Treatment</option>
          <option value="CHECKUP">Checkup</option>
        </select>
      </Field>
      <Field label="Vaccine / treatment type">
        <select name="vaccinationType" defaultValue={record.vaccinationType ?? ""} className={inputClass}>
          <option value="">— Not from schedule —</option>
          {VACCINATION_SCHEDULE.map((rule) => (
            <option key={rule.name} value={rule.name}>
              {rule.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Birds affected">
        <input name="affectedCount" type="number" min={0} defaultValue={record.affectedCount} className={inputClass} />
      </Field>
      <Field label="Diagnosis">
        <input name="diagnosis" defaultValue={record.diagnosis ?? ""} className={inputClass} />
      </Field>
      <Field label="Treatment">
        <input name="treatment" defaultValue={record.treatment ?? ""} className={inputClass} />
      </Field>
      <Field label="Medicine used">
        <input name="medicineUsed" defaultValue={record.medicineUsed ?? ""} className={inputClass} />
      </Field>
      <Field label="Cost">
        <input name="cost" type="number" min={0} step="any" defaultValue={record.cost} className={inputClass} />
      </Field>
      <Field label="Outcome">
        <select name="outcome" defaultValue={record.outcome} className={inputClass}>
          <option value="RECOVERED">Recovered</option>
          <option value="ONGOING">Ongoing</option>
          <option value="DECEASED">Deceased</option>
        </select>
      </Field>
      <div className="sm:col-span-2 lg:col-span-3">
        <Field label="Notes">
          <input name="notes" defaultValue={record.notes ?? ""} className={inputClass} />
        </Field>
      </div>
      {record.outcome === "DECEASED" && (
        <p className="text-xs text-amber-600 dark:text-amber-400 sm:col-span-2 lg:col-span-4">
          Marking this as Deceased automatically logs the loss in Mortality and reduces the flock&apos;s headcount.
        </p>
      )}
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
