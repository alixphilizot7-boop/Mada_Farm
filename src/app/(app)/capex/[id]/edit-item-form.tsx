"use client";

import { useActionState } from "react";
import { updateCapexItemAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { CapexItem } from "@prisma/client";

export function EditItemForm({ item }: { item: CapexItem }) {
  const [error, formAction, pending] = useActionState(updateCapexItemAction, undefined);
  const { t } = useI18n();
  const f = t.capex.form;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="id" value={item.id} />
      <Field label={t.capex.category}>
        <input name="category" required defaultValue={item.category} className={inputClass} />
      </Field>
      <div className="lg:col-span-2">
        <Field label={f.item}>
          <input name="name" required defaultValue={item.name} className={inputClass} />
        </Field>
      </div>
      <Field label={f.plannedQuantity}>
        <input name="plannedQuantity" type="number" min={0} step="any" defaultValue={item.plannedQuantity ?? ""} className={inputClass} />
      </Field>
      <Field label={f.plannedUnitCost}>
        <input name="plannedUnitCost" type="number" min={0} step="any" defaultValue={item.plannedUnitCost ?? ""} className={inputClass} />
      </Field>
      {(item.status === "PLANNED" || item.status === "DEFERRED") && (
        <Field label={t.common.status}>
          <select name="status" defaultValue={item.status} className={inputClass}>
            <option value="PLANNED">{t.capexStatus.PLANNED}</option>
            <option value="DEFERRED">{t.capexStatus.DEFERRED}</option>
          </select>
        </Field>
      )}
      <Field label={f.supplier}>
        <input name="supplier" defaultValue={item.supplier ?? ""} className={inputClass} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-2">
        <Field label={f.productLink}>
          <input name="link" type="url" defaultValue={item.link ?? ""} className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label={f.specs}>
          <input name="specs" defaultValue={item.specs ?? ""} className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label={t.common.notes}>
          <input name="notes" defaultValue={item.notes ?? ""} className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.common.saveChanges}
        </Button>
      </div>
    </form>
  );
}
