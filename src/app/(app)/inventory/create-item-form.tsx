"use client";

import { useActionState } from "react";
import { createItemAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";

export function CreateItemForm() {
  const [error, formAction, pending] = useActionState(createItemAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Item name">
        <input name="name" required placeholder="e.g. Layer Mash" className={inputClass} />
      </Field>
      <Field label="Type">
        <select name="type" defaultValue="FEED" className={inputClass}>
          <option value="FEED">Feed</option>
          <option value="WATER">Water</option>
          <option value="SUPPLEMENT">Supplement</option>
          <option value="MEDICINE">Medicine</option>
          <option value="OTHER">Other</option>
        </select>
      </Field>
      <Field label="Unit">
        <input name="unit" required placeholder="e.g. kg, L, bag" className={inputClass} />
      </Field>
      <Field label="Low stock alert level">
        <input name="reorderLevel" type="number" min={0} step="any" defaultValue={0} className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add item"}
        </Button>
      </div>
    </form>
  );
}
