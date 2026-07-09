"use client";

import { useActionState, useState } from "react";
import { updateUserAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import type { User } from "@prisma/client";

export function EditUserForm({ user, isSelf }: { user: User; isSelf: boolean }) {
  const [open, setOpen] = useState(false);
  const [error, formAction, pending] = useActionState(updateUserAction, undefined);

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Edit
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="userId" value={user.id} />
      <Field label="Name">
        <input name="name" required defaultValue={user.name} className={`${inputClass} w-40`} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required defaultValue={user.email} className={`${inputClass} w-56`} />
      </Field>
      <Field label="Role">
        <select name="role" defaultValue={user.role} disabled={isSelf} className={`${inputClass} w-28`}>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
      </Field>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
