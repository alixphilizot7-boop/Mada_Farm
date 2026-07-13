"use client";

import { useActionState } from "react";
import { updateItemAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { InventoryItem } from "@prisma/client";

export function EditItemForm({ item }: { item: InventoryItem }) {
  const [error, formAction, pending] = useActionState(updateItemAction, undefined);
  const { t } = useI18n();

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="id" value={item.id} />
      <Field label={t.inventory.form.itemName}>
        <input name="name" required defaultValue={item.name} className={inputClass} />
      </Field>
      <Field label={t.inventory.type}>
        <select name="type" defaultValue={item.type} className={inputClass}>
          <option value="FEED">{t.inventory.types.FEED}</option>
          <option value="WATER">{t.inventory.types.WATER}</option>
          <option value="SUPPLEMENT">{t.inventory.types.SUPPLEMENT}</option>
          <option value="MEDICINE">{t.inventory.types.MEDICINE}</option>
          <option value="OTHER">{t.inventory.types.OTHER}</option>
        </select>
      </Field>
      <Field label={t.inventory.form.unit}>
        <input name="unit" required defaultValue={item.unit} className={inputClass} />
      </Field>
      <Field label={t.inventory.form.reorderLevel}>
        <input
          name="reorderLevel"
          type="number"
          min={0}
          step="any"
          defaultValue={item.reorderLevel}
          className={inputClass}
        />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.common.saveChanges}
        </Button>
      </div>
    </form>
  );
}
