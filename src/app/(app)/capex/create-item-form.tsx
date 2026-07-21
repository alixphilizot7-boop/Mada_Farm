"use client";

import { useActionState } from "react";
import { createCapexItemAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";

export function CreateItemForm() {
  const [error, formAction, pending] = useActionState(createCapexItemAction, undefined);
  const { t } = useI18n();
  const f = t.capex.form;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label={t.capex.category}>
        <input name="category" required placeholder={f.categoryPlaceholder} className={inputClass} />
      </Field>
      <div className="lg:col-span-2">
        <Field label={f.item}>
          <input name="name" required placeholder={f.itemPlaceholder} className={inputClass} />
        </Field>
      </div>
      <Field label={f.plannedQuantity}>
        <input name="plannedQuantity" type="number" min={0} step="any" className={inputClass} />
      </Field>
      <Field label={f.plannedUnitCost}>
        <input name="plannedUnitCost" type="number" min={0} step="any" className={inputClass} />
      </Field>
      <Field label={t.common.status}>
        <select name="status" defaultValue="PLANNED" className={inputClass}>
          <option value="PLANNED">{t.capexStatus.PLANNED}</option>
          <option value="DEFERRED">{t.capexStatus.DEFERRED}</option>
        </select>
      </Field>
      <Field label={f.supplier}>
        <input name="supplier" placeholder={f.supplierPlaceholder} className={inputClass} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-2">
        <Field label={f.productLink}>
          <input name="link" type="url" className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label={f.specs}>
          <input name="specs" className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label={t.common.notes}>
          <input name="notes" className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? f.adding : f.add}
        </Button>
      </div>
    </form>
  );
}
