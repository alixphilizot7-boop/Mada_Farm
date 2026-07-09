"use client";

import { useActionState } from "react";
import { changePasswordAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";

export function ChangePasswordForm() {
  const [message, formAction, pending] = useActionState(changePasswordAction, undefined);

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <Field label="Current password">
        <input name="currentPassword" type="password" required className={inputClass} />
      </Field>
      <Field label="New password">
        <input name="newPassword" type="password" minLength={6} required className={inputClass} />
      </Field>
      {message && (
        <p
          className={
            message === "Password updated."
              ? "text-sm text-emerald-600"
              : "text-sm text-red-600"
          }
        >
          {message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Update password"}
      </Button>
    </form>
  );
}
