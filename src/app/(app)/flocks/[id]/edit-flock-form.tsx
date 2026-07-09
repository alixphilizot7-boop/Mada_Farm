"use client";

import { useActionState } from "react";
import { updateFlockAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import type { Flock } from "@prisma/client";

export function EditFlockForm({ flock }: { flock: Flock }) {
  const [error, formAction, pending] = useActionState(updateFlockAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={flock.id} />
      <Field label="Flock name">
        <input name="name" defaultValue={flock.name} required className={inputClass} />
      </Field>
      <Field label="Breed">
        <input name="breed" defaultValue={flock.breed ?? ""} className={inputClass} />
      </Field>
      <Field label="Status">
        <select name="status" defaultValue={flock.status} className={inputClass}>
          <option value="ACTIVE">Active</option>
          <option value="SOLD_OUT">Sold out</option>
          <option value="CLOSED">Closed</option>
        </select>
      </Field>
      <Field label="Notes">
        <input name="notes" defaultValue={flock.notes ?? ""} className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
