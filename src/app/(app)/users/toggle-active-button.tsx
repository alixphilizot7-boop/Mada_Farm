"use client";

import { Button } from "@/components/ui";
import { toggleUserActiveAction } from "./actions";
import { useI18n } from "@/components/i18n-provider";

export function ToggleActiveButton({ userId, active, name }: { userId: string; active: boolean; name: string }) {
  const { t } = useI18n();
  const u = t.users;

  return (
    <form
      action={toggleUserActiveAction.bind(null, userId)}
      onSubmit={(e) => {
        if (active && !confirm(`${u.deactivateConfirm} ${name}${u.deactivateConfirmSuffix}`)) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant={active ? "danger" : "secondary"}>
        {active ? u.deactivate : u.activate}
      </Button>
    </form>
  );
}
