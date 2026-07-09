"use client";

import { useActionState } from "react";
import { createUserAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";

export function CreateUserForm() {
  const [error, formAction, pending] = useActionState(createUserAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name">
        <input name="name" required className={inputClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Temporary password">
        <input name="password" type="password" minLength={6} required className={inputClass} />
      </Field>
      <Field label="Role">
        <select name="role" defaultValue="STAFF" className={inputClass}>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
      </Field>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create account"}
        </Button>
      </div>
    </form>
  );
}
