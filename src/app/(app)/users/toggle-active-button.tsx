"use client";

import { Button } from "@/components/ui";
import { toggleUserActiveAction } from "./actions";

export function ToggleActiveButton({ userId, active, name }: { userId: string; active: boolean; name: string }) {
  return (
    <form
      action={toggleUserActiveAction.bind(null, userId)}
      onSubmit={(e) => {
        if (active && !confirm(`Deactivate ${name}? They won't be able to sign in until reactivated.`)) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant={active ? "danger" : "secondary"}>
        {active ? "Deactivate" : "Activate"}
      </Button>
    </form>
  );
}
