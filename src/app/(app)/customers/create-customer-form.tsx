"use client";

import { useActionState } from "react";
import { createCustomerAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";

export function CreateCustomerForm() {
  const [error, formAction, pending] = useActionState(createCustomerAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Name">
        <input name="name" required className={inputClass} />
      </Field>
      <Field label="Phone">
        <input name="phone" className={inputClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" className={inputClass} />
      </Field>
      <Field label="Address">
        <input name="address" className={inputClass} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label="Notes">
          <input name="notes" className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add customer"}
        </Button>
      </div>
    </form>
  );
}
