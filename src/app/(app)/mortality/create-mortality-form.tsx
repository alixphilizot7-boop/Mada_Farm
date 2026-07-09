"use client";

import { useActionState } from "react";
import { createMortalityLogAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import type { Flock } from "@prisma/client";

export function CreateMortalityForm({ flocks }: { flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(createMortalityLogAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              {flock.name} ({flock.currentCount} birds)
            </option>
          ))}
        </select>
      </Field>
      <Field label="Birds lost">
        <input name="quantity" type="number" min={1} required className={inputClass} />
      </Field>
      <Field label="Cause">
        <input name="cause" placeholder="e.g. disease, predator" className={inputClass} />
      </Field>
      <Field label="Notes">
        <input name="notes" className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" variant="danger" disabled={pending}>
          {pending ? "Saving..." : "Log loss"}
        </Button>
      </div>
    </form>
  );
}
