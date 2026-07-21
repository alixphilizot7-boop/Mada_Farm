"use client";

import { useActionState } from "react";
import { createUserAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";

export function CreateUserForm() {
  const [error, formAction, pending] = useActionState(createUserAction, undefined);
  const { t } = useI18n();
  const f = t.users.form;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label={f.fullName}>
        <input name="name" required className={inputClass} />
      </Field>
      <Field label={f.email}>
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label={f.tempPassword}>
        <input name="password" type="password" minLength={6} required className={inputClass} />
      </Field>
      <Field label={f.role}>
        <select name="role" defaultValue="STAFF" className={inputClass}>
          <option value="STAFF">{t.users.roleStaff}</option>
          <option value="EMPLOYEE">{t.users.roleEmployee}</option>
          <option value="ADMIN">{t.users.roleAdmin}</option>
        </select>
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? f.creating : f.create}
        </Button>
      </div>
    </form>
  );
}
