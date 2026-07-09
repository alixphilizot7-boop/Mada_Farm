"use client";

import { useActionState } from "react";
import { updateCapexItemAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import type { CapexItem } from "@prisma/client";

export function EditItemForm({ item }: { item: CapexItem }) {
  const [error, formAction, pending] = useActionState(updateCapexItemAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="id" value={item.id} />
      <Field label="Category">
        <input name="category" required defaultValue={item.category} className={inputClass} />
      </Field>
      <div className="lg:col-span-2">
        <Field label="Item">
          <input name="name" required defaultValue={item.name} className={inputClass} />
        </Field>
      </div>
      <Field label="Planned quantity">
        <input name="plannedQuantity" type="number" min={0} step="any" defaultValue={item.plannedQuantity ?? ""} className={inputClass} />
      </Field>
      <Field label="Planned unit cost">
        <input name="plannedUnitCost" type="number" min={0} step="any" defaultValue={item.plannedUnitCost ?? ""} className={inputClass} />
      </Field>
      <Field label="Supplier / platform">
        <input name="supplier" defaultValue={item.supplier ?? ""} className={inputClass} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-2">
        <Field label="Product link">
          <input name="link" type="url" defaultValue={item.link ?? ""} className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label="Specs / requirements">
          <input name="specs" defaultValue={item.specs ?? ""} className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label="Notes">
          <input name="notes" defaultValue={item.notes ?? ""} className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
