"use client";

import { useActionState } from "react";
import { updateManualCashTransactionAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import { useI18n } from "@/components/i18n-provider";
import type { CashTransaction } from "@prisma/client";

export function EditTransactionForm({ txn }: { txn: CashTransaction }) {
  const [error, formAction, pending] = useActionState(updateManualCashTransactionAction, undefined);
  const { t } = useI18n();
  const f = t.cashflow.form;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <input type="hidden" name="id" value={txn.id} />
      <Field label={t.common.date}>
        <input name="date" type="date" required defaultValue={toDateInputValue(txn.date)} className={inputClass} />
      </Field>
      <Field label={f.type}>
        <select name="type" defaultValue={txn.type} className={inputClass}>
          <option value="INCOME">{t.cashType.INCOME}</option>
          <option value="EXPENSE">{t.cashType.EXPENSE}</option>
        </select>
      </Field>
      <Field label={f.category}>
        <input name="category" required defaultValue={txn.category} className={inputClass} />
      </Field>
      <Field label={f.amount}>
        <input name="amount" type="number" min={0} step="any" required defaultValue={txn.amount} className={inputClass} />
      </Field>
      <Field label={f.description}>
        <input name="description" defaultValue={txn.description ?? ""} className={inputClass} />
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
