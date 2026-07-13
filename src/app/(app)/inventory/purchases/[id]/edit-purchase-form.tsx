"use client";

import { useActionState } from "react";
import { updatePurchaseAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import { useI18n } from "@/components/i18n-provider";
import type { InventoryItem, Purchase } from "@prisma/client";

export function EditPurchaseForm({ purchase, items }: { purchase: Purchase; items: InventoryItem[] }) {
  const [error, formAction, pending] = useActionState(updatePurchaseAction, undefined);
  const { t } = useI18n();
  const p = t.inventory.purchasesPage;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <input type="hidden" name="id" value={purchase.id} />
      <Field label={t.common.date}>
        <input name="date" type="date" required defaultValue={toDateInputValue(purchase.date)} className={inputClass} />
      </Field>
      <Field label={t.inventory.item}>
        <select name="itemId" required defaultValue={purchase.itemId} className={inputClass}>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.unit})
            </option>
          ))}
        </select>
      </Field>
      <Field label={p.form.quantity}>
        <input name="quantity" type="number" min={0} step="any" required defaultValue={purchase.quantity} className={inputClass} />
      </Field>
      <Field label={p.form.unitCost}>
        <input name="unitCost" type="number" min={0} step="any" required defaultValue={purchase.unitCost} className={inputClass} />
      </Field>
      <Field label={p.form.supplier}>
        <input name="supplier" defaultValue={purchase.supplier ?? ""} className={inputClass} />
      </Field>
      <Field label={t.common.notes}>
        <input name="notes" defaultValue={purchase.notes ?? ""} className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-6">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.common.saveChanges}
        </Button>
      </div>
    </form>
  );
}
