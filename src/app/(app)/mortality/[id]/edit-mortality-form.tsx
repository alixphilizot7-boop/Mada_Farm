"use client";

import { useActionState } from "react";
import { updateMortalityLogAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import type { Flock, MortalityLog } from "@prisma/client";

export function EditMortalityForm({ log, flocks }: { log: MortalityLog; flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(updateMortalityLogAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <input type="hidden" name="id" value={log.id} />
      <Field label="Date">
        <input name="date" type="date" required defaultValue={toDateInputValue(log.date)} className={inputClass} />
      </Field>
      <Field label="Flock">
        <select name="flockId" required defaultValue={log.flockId} className={inputClass}>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Birds lost">
        <input name="quantity" type="number" min={1} required defaultValue={log.quantity} className={inputClass} />
      </Field>
      <Field label="Cause">
        <input name="cause" defaultValue={log.cause ?? ""} className={inputClass} />
      </Field>
      <Field label="Notes">
        <input name="notes" defaultValue={log.notes ?? ""} className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" variant="danger" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
