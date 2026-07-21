"use client";

import { useActionState } from "react";
import { updateFarmSettingsAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import { useI18n } from "@/components/i18n-provider";
import type { FarmSettings } from "@prisma/client";

export function FarmSettingsForm({ settings }: { settings: FarmSettings }) {
  const [error, formAction, pending] = useActionState(updateFarmSettingsAction, undefined);
  const { t } = useI18n();
  const s = t.settings;

  return (
    <form action={formAction} className="max-w-xs space-y-4">
      <Field label={s.farmStartDate}>
        <input
          name="farmStartDate"
          type="date"
          required
          defaultValue={toDateInputValue(settings.farmStartDate)}
          className={inputClass}
        />
      </Field>
      <p className="text-xs text-stone-500 dark:text-stone-400">{s.farmStartDateHint}</p>
      <Field label={s.exchangeRate}>
        <input
          name="mgaPerEur"
          type="number"
          min={0}
          step="any"
          required
          defaultValue={settings.mgaPerEur}
          className={inputClass}
        />
      </Field>
      <p className="text-xs text-stone-500 dark:text-stone-400">{s.exchangeRateHint}</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? s.saving : s.save}
      </Button>
    </form>
  );
}
