"use client";

import { useActionState, useState } from "react";
import { resetPasswordAction } from "./actions";
import { Button, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [error, formAction, pending] = useActionState(resetPasswordAction, undefined);
  const { t } = useI18n();
  const u = t.users;

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        {u.resetPassword}
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input
        name="password"
        type="password"
        placeholder={u.newPassword}
        minLength={6}
        required
        className={`${inputClass} w-40`}
      />
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
