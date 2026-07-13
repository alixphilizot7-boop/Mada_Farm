"use client";

import { useActionState } from "react";
import { createUsageAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { Flock, InventoryItem } from "@prisma/client";

export function CreateUsageForm({ items, flocks }: { items: InventoryItem[]; flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(createUsageAction, undefined);
  const { t } = useI18n();
  const u = t.inventory.usagePage;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Field label={t.common.date}>
        <input
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={inputClass}
        />
      </Field>
      <Field label={t.inventory.item}>
        <select name="itemId" required className={inputClass}>
          <option value="">{u.selectItem}</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.currentStock} {item.unit} {u.inStock})
            </option>
          ))}
        </select>
      </Field>
      <Field label={u.form.flockOptional}>
        <select name="flockId" className={inputClass}>
          <option value="">{u.wholeFarm}</option>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={u.form.quantityGiven}>
        <input name="quantity" type="number" min={0} step="any" required className={inputClass} />
      </Field>
      <Field label={t.common.notes}>
        <input name="notes" className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? u.form.logging : u.form.log}
        </Button>
      </div>
    </form>
  );
}
