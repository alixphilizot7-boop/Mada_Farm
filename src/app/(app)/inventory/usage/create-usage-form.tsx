"use client";

import { useActionState } from "react";
import { createUsageAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import type { Flock, InventoryItem } from "@prisma/client";

export function CreateUsageForm({ items, flocks }: { items: InventoryItem[]; flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(createUsageAction, undefined);

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
      <Field label="Item">
        <select name="itemId" required className={inputClass}>
          <option value="">Select item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.currentStock} {item.unit} in stock)
            </option>
          ))}
        </select>
      </Field>
      <Field label="Flock (optional)">
        <select name="flockId" className={inputClass}>
          <option value="">Whole farm</option>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Quantity given">
        <input name="quantity" type="number" min={0} step="any" required className={inputClass} />
      </Field>
      <Field label="Notes">
        <input name="notes" className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Log usage"}
        </Button>
      </div>
    </form>
  );
}
