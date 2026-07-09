"use client";

import { useActionState } from "react";
import { updateCustomerAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import type { Customer } from "@prisma/client";

export function EditCustomerForm({ customer }: { customer: Customer }) {
  const [error, formAction, pending] = useActionState(updateCustomerAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="id" value={customer.id} />
      <Field label="Name">
        <input name="name" required defaultValue={customer.name} className={inputClass} />
      </Field>
      <Field label="Phone">
        <input name="phone" defaultValue={customer.phone ?? ""} className={inputClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" defaultValue={customer.email ?? ""} className={inputClass} />
      </Field>
      <Field label="Address">
        <input name="address" defaultValue={customer.address ?? ""} className={inputClass} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label="Notes">
          <input name="notes" defaultValue={customer.notes ?? ""} className={inputClass} />
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
