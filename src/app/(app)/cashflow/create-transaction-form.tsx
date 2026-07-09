"use client";

import { useActionState } from "react";
import { createManualCashTransactionAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";

export function CreateTransactionForm() {
  const [error, formAction, pending] = useActionState(createManualCashTransactionAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Field label="Date">
        <input
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={inputClass}
        />
      </Field>
      <Field label="Type">
        <select name="type" defaultValue="EXPENSE" className={inputClass}>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </Field>
      <Field label="Category">
        <input name="category" required placeholder="e.g. Transport, Equipment" className={inputClass} />
      </Field>
      <Field label="Amount">
        <input name="amount" type="number" min={0} step="any" required className={inputClass} />
      </Field>
      <Field label="Description">
        <input name="description" className={inputClass} />
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Add entry"}
        </Button>
      </div>
    </form>
  );
}
