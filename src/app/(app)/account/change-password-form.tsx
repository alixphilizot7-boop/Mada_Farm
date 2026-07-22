"use client";

import { useActionState } from "react";
import { changePasswordAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";

export function ChangePasswordForm() {
  const [message, formAction, pending] = useActionState(changePasswordAction, undefined);
  const { t } = useI18n();
  const a = t.account;

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <Field label={a.currentPassword}>
        <input name="currentPassword" type="password" required className={inputClass} />
      </Field>
      <Field label={a.newPassword}>
        <input name="newPassword" type="password" minLength={6} required className={inputClass} />
      </Field>
      {message && (
        <p
          className={
            message === a.passwordUpdated
              ? "text-sm text-emerald-600"
              : "text-sm text-red-600"
          }
        >
          {message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? a.saving : a.updatePassword}
      </Button>
    </form>
  );
}
