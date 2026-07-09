"use client";

import { useActionState } from "react";
import { updatePurchaseAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import type { InventoryItem, Purchase } from "@prisma/client";

export function EditPurchaseForm({ purchase, items }: { purchase: Purchase; items: InventoryItem[] }) {
  const [error, formAction, pending] = useActionState(updatePurchaseAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <input type="hidden" name="id" value={purchase.id} />
      <Field label="Date">
        <input name="date" type="date" required defaultValue={toDateInputValue(purchase.date)} className={inputClass} />
      </Field>
      <Field label="Item">
        <select name="itemId" required defaultValue={purchase.itemId} className={inputClass}>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.unit})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Quantity">
        <input name="quantity" type="number" min={0} step="any" required defaultValue={purchase.quantity} className={inputClass} />
      </Field>
      <Field label="Unit cost">
        <input name="unitCost" type="number" min={0} step="any" required defaultValue={purchase.unitCost} className={inputClass} />
      </Field>
      <Field label="Supplier">
        <input name="supplier" defaultValue={purchase.supplier ?? ""} className={inputClass} />
      </Field>
      <Field label="Notes">
        <input name="notes" defaultValue={purchase.notes ?? ""} className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-6">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
