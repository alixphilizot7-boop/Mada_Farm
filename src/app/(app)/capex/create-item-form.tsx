"use client";

import { useActionState } from "react";
import { createCapexItemAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";

export function CreateItemForm() {
  const [error, formAction, pending] = useActionState(createCapexItemAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Category">
        <input name="category" required placeholder="e.g. Construction, Équipement" className={inputClass} />
      </Field>
      <div className="lg:col-span-2">
        <Field label="Item">
          <input name="name" required placeholder="e.g. Incubateur 204 œufs automatique" className={inputClass} />
        </Field>
      </div>
      <Field label="Planned quantity">
        <input name="plannedQuantity" type="number" min={0} step="any" className={inputClass} />
      </Field>
      <Field label="Planned unit cost">
        <input name="plannedUnitCost" type="number" min={0} step="any" className={inputClass} />
      </Field>
      <Field label="Supplier / platform">
        <input name="supplier" placeholder="e.g. Alibaba, local" className={inputClass} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-2">
        <Field label="Product link">
          <input name="link" type="url" className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label="Specs / requirements">
          <input name="specs" className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label="Notes">
          <input name="notes" className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add item"}
        </Button>
      </div>
    </form>
  );
}
