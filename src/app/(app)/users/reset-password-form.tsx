"use client";

import { useActionState, useState } from "react";
import { resetPasswordAction } from "./actions";
import { Button, inputClass } from "@/components/ui";

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [error, formAction, pending] = useActionState(resetPasswordAction, undefined);

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Reset password
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input
        name="password"
        type="password"
        placeholder="New password"
        minLength={6}
        required
        className={`${inputClass} w-40`}
      />
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
