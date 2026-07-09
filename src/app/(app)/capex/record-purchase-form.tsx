"use client";

import { useActionState, useState } from "react";
import { recordCapexPurchaseAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import type { CapexItem } from "@prisma/client";

export function RecordPurchaseForm({ item }: { item: CapexItem }) {
  const [open, setOpen] = useState(false);
  const [error, formAction, pending] = useActionState(recordCapexPurchaseAction, undefined);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Record purchase
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={item.id} />
      <Field label="Date">
        <input
          name="purchaseDate"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={`${inputClass} w-36`}
        />
      </Field>
      <Field label="Qty bought">
        <input
          name="actualQuantity"
          type="number"
          min={0}
          step="any"
          required
          defaultValue={item.plannedQuantity ?? undefined}
          className={`${inputClass} w-24`}
        />
      </Field>
      <Field label="Unit cost paid">
        <input
          name="actualUnitCost"
          type="number"
          min={0}
          step="any"
          required
          defaultValue={item.plannedUnitCost ?? undefined}
          className={`${inputClass} w-28`}
        />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Confirm"}
      </Button>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
