"use client";

import { useActionState } from "react";
import { createManualCashTransactionAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";

export function CreateTransactionForm() {
  const [error, formAction, pending] = useActionState(createManualCashTransactionAction, undefined);
  const { t } = useI18n();
  const f = t.cashflow.form;

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
      <Field label={f.type}>
        <select name="type" defaultValue="EXPENSE" className={inputClass}>
          <option value="INCOME">{t.cashType.INCOME}</option>
          <option value="EXPENSE">{t.cashType.EXPENSE}</option>
        </select>
      </Field>
      <Field label={f.category}>
        <input name="category" required placeholder={f.categoryPlaceholder} className={inputClass} />
      </Field>
      <Field label={f.amount}>
        <input name="amount" type="number" min={0} step="any" required className={inputClass} />
      </Field>
      <Field label={f.description}>
        <input name="description" className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? f.adding : f.add}
        </Button>
      </div>
    </form>
  );
}
