"use client";

import { useActionState } from "react";
import { updateUsageAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import { useI18n } from "@/components/i18n-provider";
import type { Flock, InventoryItem, Usage } from "@prisma/client";

export function EditUsageForm({ usage, items, flocks }: { usage: Usage; items: InventoryItem[]; flocks: Flock[] }) {
  const [error, formAction, pending] = useActionState(updateUsageAction, undefined);
  const { t } = useI18n();
  const u = t.inventory.usagePage;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <input type="hidden" name="id" value={usage.id} />
      <Field label={t.common.date}>
        <input name="date" type="date" required defaultValue={toDateInputValue(usage.date)} className={inputClass} />
      </Field>
      <Field label={t.inventory.item}>
        <select name="itemId" required defaultValue={usage.itemId} className={inputClass}>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.currentStock} {item.unit} {u.inStock})
            </option>
          ))}
        </select>
      </Field>
      <Field label={u.form.flockOptional}>
        <select name="flockId" defaultValue={usage.flockId ?? ""} className={inputClass}>
          <option value="">{u.wholeFarm}</option>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={u.form.quantityGiven}>
        <input name="quantity" type="number" min={0} step="any" required defaultValue={usage.quantity} className={inputClass} />
      </Field>
      <Field label={t.common.notes}>
        <input name="notes" defaultValue={usage.notes ?? ""} className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.common.saveChanges}
        </Button>
      </div>
    </form>
  );
}
