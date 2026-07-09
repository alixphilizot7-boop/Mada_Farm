"use client";

import { useActionState } from "react";
import { createFlockAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";

export function CreateFlockForm() {
  const [error, formAction, pending] = useActionState(createFlockAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Flock name">
        <input name="name" required placeholder="e.g. Layers Batch 3" className={inputClass} />
      </Field>
      <Field label="Breed">
        <input name="breed" placeholder="e.g. Leghorn" className={inputClass} />
      </Field>
      <Field label="Start date">
        <input name="startDate" type="date" required className={inputClass} />
      </Field>
      <Field label="Initial bird count">
        <input name="initialCount" type="number" min={1} required className={inputClass} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label="Notes">
          <input name="notes" className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create flock"}
        </Button>
      </div>
    </form>
  );
}
