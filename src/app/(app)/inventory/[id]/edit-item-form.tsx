"use client";

import { useActionState } from "react";
import { updateItemAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import type { InventoryItem } from "@prisma/client";

export function EditItemForm({ item }: { item: InventoryItem }) {
  const [error, formAction, pending] = useActionState(updateItemAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="id" value={item.id} />
      <Field label="Item name">
        <input name="name" required defaultValue={item.name} className={inputClass} />
      </Field>
      <Field label="Type">
        <select name="type" defaultValue={item.type} className={inputClass}>
          <option value="FEED">Feed</option>
          <option value="WATER">Water</option>
          <option value="SUPPLEMENT">Supplement</option>
          <option value="MEDICINE">Medicine</option>
          <option value="OTHER">Other</option>
        </select>
      </Field>
      <Field label="Unit">
        <input name="unit" required defaultValue={item.unit} className={inputClass} />
      </Field>
      <Field label="Low stock alert level">
        <input
          name="reorderLevel"
          type="number"
          min={0}
          step="any"
          defaultValue={item.reorderLevel}
          className={inputClass}
        />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
