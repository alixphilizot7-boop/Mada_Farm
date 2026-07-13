"use client";

import { useActionState, useState } from "react";
import { updateUserAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { User } from "@prisma/client";

export function EditUserForm({ user, isSelf }: { user: User; isSelf: boolean }) {
  const [open, setOpen] = useState(false);
  const [error, formAction, pending] = useActionState(updateUserAction, undefined);
  const { t } = useI18n();
  const u = t.users;

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        {u.edit}
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="userId" value={user.id} />
      <Field label={u.name}>
        <input name="name" required defaultValue={user.name} className={`${inputClass} w-40`} />
      </Field>
      <Field label={u.email}>
        <input name="email" type="email" required defaultValue={user.email} className={`${inputClass} w-56`} />
      </Field>
      <Field label={u.role}>
        <select name="role" defaultValue={user.role} disabled={isSelf} className={`${inputClass} w-28`}>
          <option value="STAFF">{u.roleStaff}</option>
          <option value="ADMIN">{u.roleAdmin}</option>
        </select>
      </Field>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? u.saving : u.save}
      </Button>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        {u.cancel}
      </Button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
