"use client";

import { useActionState } from "react";
import { createEggLogAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import type { Flock } from "@prisma/client";

export function CreateEggLogForm({ flocks }: { flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(createEggLogAction, undefined);

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
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Whole eggs">
        <input name="wholeCount" type="number" min={0} required className={inputClass} />
      </Field>
      <Field label="Broken eggs">
        <input name="brokenCount" type="number" min={0} defaultValue={0} className={inputClass} />
      </Field>
      <Field label="Notes">
        <input name="notes" className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Log eggs"}
        </Button>
      </div>
    </form>
  );
}
