"use client";

import { useActionState } from "react";
import { createPurchaseAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import type { InventoryItem } from "@prisma/client";

export function CreatePurchaseForm({ items }: { items: InventoryItem[] }) {
  const [error, formAction, pending] = useActionState(createPurchaseAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <Field label="Date">
        <input
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={inputClass}
        />
      </Field>
      <Field label="Item">
        <select name="itemId" required className={inputClass}>
          <option value="">Select item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.unit})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Quantity">
        <input name="quantity" type="number" min={0} step="any" required className={inputClass} />
      </Field>
      <Field label="Unit cost">
        <input name="unitCost" type="number" min={0} step="any" required className={inputClass} />
      </Field>
      <Field label="Supplier">
        <input name="supplier" className={inputClass} />
      </Field>
      <Field label="Notes">
        <input name="notes" className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-6">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Record purchase"}
        </Button>
      </div>
    </form>
  );
}
