"use client";

import { useActionState } from "react";
import { createCustomerAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";

export function CreateCustomerForm() {
  const [error, formAction, pending] = useActionState(createCustomerAction, undefined);
  const { t } = useI18n();

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label={t.customers.name}>
        <input name="name" required className={inputClass} />
      </Field>
      <Field label={t.customers.phone}>
        <input name="phone" className={inputClass} />
      </Field>
      <Field label={t.customers.email}>
        <input name="email" type="email" className={inputClass} />
      </Field>
      <Field label={t.customers.address}>
        <input name="address" className={inputClass} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-4">
        <Field label={t.common.notes}>
          <input name="notes" className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.customers.form.adding : t.customers.form.add}
        </Button>
      </div>
    </form>
  );
}
