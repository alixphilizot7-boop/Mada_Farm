"use client";

import { useActionState } from "react";
import { createPurchaseAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { InventoryItem } from "@prisma/client";

export function CreatePurchaseForm({ items }: { items: InventoryItem[] }) {
  const [error, formAction, pending] = useActionState(createPurchaseAction, undefined);
  const { t } = useI18n();
  const p = t.inventory.purchasesPage;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
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
          <option value="">{p.selectItem}</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.unit})
            </option>
          ))}
        </select>
      </Field>
      <Field label={p.form.quantity}>
        <input name="quantity" type="number" min={0} step="any" required className={inputClass} />
      </Field>
      <Field label={p.form.unitCost}>
        <input name="unitCost" type="number" min={0} step="any" required className={inputClass} />
      </Field>
      <Field label={p.form.supplier}>
        <input name="supplier" className={inputClass} />
      </Field>
      <Field label={t.common.notes}>
        <input name="notes" className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-6">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? p.form.recording : p.form.record}
        </Button>
      </div>
    </form>
  );
}
