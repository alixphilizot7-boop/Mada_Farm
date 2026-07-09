"use client";

import { useActionState } from "react";
import { updateChickHatchAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import type { ChickHatch, Flock } from "@prisma/client";

export function EditChickHatchForm({ hatch, flocks }: { hatch: ChickHatch; flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(updateChickHatchAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <input type="hidden" name="id" value={hatch.id} />
      <Field label="Hatch date">
        <input name="date" type="date" required defaultValue={toDateInputValue(hatch.date)} className={inputClass} />
      </Field>
      <Field label="Eggs set">
        <input name="eggsSet" type="number" min={1} required defaultValue={hatch.eggsSet} className={inputClass} />
      </Field>
      <Field label="Chicks hatched">
        <input name="chicksHatched" type="number" min={0} required defaultValue={hatch.chicksHatched} className={inputClass} />
      </Field>
      <Field label="Flock (optional)">
        <select name="flockId" defaultValue={hatch.flockId ?? ""} className={inputClass}>
          <option value="">New / unassigned batch</option>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notes">
        <input name="notes" defaultValue={hatch.notes ?? ""} className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
