"use client";

import { useActionState } from "react";
import { createHealthRecordAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { VACCINATION_SCHEDULE } from "@/lib/vaccination-schedule";
import type { Flock } from "@prisma/client";

export function CreateHealthRecordForm({ flocks }: { flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(createHealthRecordAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Date">
        <input
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={inputClass}
        />
      </Field>
      <Field label="Flock">
        <select name="flockId" required className={inputClass}>
          <option value="">Select flock</option>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Type">
        <select name="type" defaultValue="ILLNESS" className={inputClass}>
          <option value="ILLNESS">Illness</option>
          <option value="VACCINATION">Vaccination</option>
          <option value="TREATMENT">Treatment</option>
          <option value="CHECKUP">Checkup</option>
        </select>
      </Field>
      <Field label="Vaccine / treatment type">
        <select name="vaccinationType" defaultValue="" className={inputClass}>
          <option value="">— Not from schedule —</option>
          {VACCINATION_SCHEDULE.map((rule) => (
            <option key={rule.name} value={rule.name}>
              {rule.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Birds affected">
        <input name="affectedCount" type="number" min={0} defaultValue={0} className={inputClass} />
      </Field>
      <Field label="Diagnosis">
        <input name="diagnosis" className={inputClass} />
      </Field>
      <Field label="Treatment">
        <input name="treatment" className={inputClass} />
      </Field>
      <Field label="Medicine used">
        <input name="medicineUsed" className={inputClass} />
      </Field>
      <Field label="Cost">
        <input name="cost" type="number" min={0} step="any" defaultValue={0} className={inputClass} />
      </Field>
      <Field label="Outcome">
        <select name="outcome" defaultValue="ONGOING" className={inputClass}>
          <option value="RECOVERED">Recovered</option>
          <option value="ONGOING">Ongoing</option>
          <option value="DECEASED">Deceased</option>
        </select>
      </Field>
      <div className="sm:col-span-2 lg:col-span-3">
        <Field label="Notes">
          <input name="notes" className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Log health record"}
        </Button>
      </div>
    </form>
  );
}
