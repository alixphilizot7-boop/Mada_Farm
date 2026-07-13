"use client";

import { useActionState } from "react";
import { updateCustomerAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { Customer } from "@prisma/client";

export function EditCustomerForm({ customer }: { customer: Customer }) {
  const [error, formAction, pending] = useActionState(updateCustomerAction, undefined);
  const { t } = useI18n();

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="id" value={customer.id} />
      <Field label={t.customers.name}>
        <input name="name" required defaultValue={customer.name} className={inputClass} />
      </Field>
      <Field label={t.customers.phone}>
        <input name="phone" defaultValue={customer.phone ?? ""} className={inputClass} />
      </Field>
      <Field label={t.customers.email}>
        <input name="email" type="email" defaultValue={customer.email ?? ""} className={inputClass} />
      </Field>
      <Field label={t.customers.address}>
        <input name="address" defaultValue={customer.address ?? ""} className={inputClass} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label={t.common.notes}>
          <input name="notes" defaultValue={customer.notes ?? ""} className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.common.saving : t.common.saveChanges}
        </Button>
      </div>
    </form>
  );
}
