"use client";

import { useActionState } from "react";
import { createItemAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";

export function CreateItemForm() {
  const [error, formAction, pending] = useActionState(createItemAction, undefined);
  const { t } = useI18n();

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label={t.inventory.form.itemName}>
        <input name="name" required placeholder={t.inventory.form.itemNamePlaceholder} className={inputClass} />
      </Field>
      <Field label={t.inventory.type}>
        <select name="type" defaultValue="FEED" className={inputClass}>
          <option value="FEED">{t.inventory.types.FEED}</option>
          <option value="WATER">{t.inventory.types.WATER}</option>
          <option value="SUPPLEMENT">{t.inventory.types.SUPPLEMENT}</option>
          <option value="MEDICINE">{t.inventory.types.MEDICINE}</option>
          <option value="OTHER">{t.inventory.types.OTHER}</option>
        </select>
      </Field>
      <Field label={t.inventory.form.unit}>
        <input name="unit" required placeholder={t.inventory.form.unitPlaceholder} className={inputClass} />
      </Field>
      <Field label={t.inventory.form.reorderLevel}>
        <input name="reorderLevel" type="number" min={0} step="any" defaultValue={0} className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.inventory.form.adding : t.inventory.form.addItem}
        </Button>
      </div>
    </form>
  );
}
