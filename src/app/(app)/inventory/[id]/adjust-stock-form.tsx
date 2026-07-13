"use client";

import { useActionState, useState } from "react";
import { adjustStockAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { InventoryItem } from "@prisma/client";

export function AdjustStockForm({ item }: { item: InventoryItem }) {
  const [open, setOpen] = useState(false);
  const [error, formAction, pending] = useActionState(adjustStockAction, undefined);
  const { t } = useI18n();

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {t.inventory.adjustForm.adjustStock}
      </Button>
    );
  }

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-3">
      <input type="hidden" name="id" value={item.id} />
      <Field label={`${t.inventory.adjustForm.newStockLevel} (${item.unit})`}>
        <input name="newStock" type="number" min={0} step="any" required defaultValue={item.currentStock} className={inputClass} />
      </Field>
      <div className="sm:col-span-2">
        <Field label={t.inventory.adjustForm.reason}>
          <input name="reason" required placeholder={t.inventory.adjustForm.reasonPlaceholder} className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-3">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? t.common.saving : t.inventory.adjustForm.confirm}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          {t.common.cancel}
        </Button>
      </div>
    </form>
  );
}
