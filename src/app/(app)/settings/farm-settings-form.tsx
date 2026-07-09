"use client";

import { useActionState } from "react";
import { updateFarmSettingsAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import type { FarmSettings } from "@prisma/client";

export function FarmSettingsForm({ settings }: { settings: FarmSettings }) {
  const [error, formAction, pending] = useActionState(updateFarmSettingsAction, undefined);

  return (
    <form action={formAction} className="max-w-xs space-y-4">
      <Field label="Farm start date">
        <input
          name="farmStartDate"
          type="date"
          required
          defaultValue={toDateInputValue(settings.farmStartDate)}
          className={inputClass}
        />
      </Field>
      <p className="text-xs text-stone-500 dark:text-stone-400">
        Used to work out which year of your business plan you&apos;re currently in.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
