"use client";

import { useActionState } from "react";
import { createDailyLogAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { Flock, InventoryItem } from "@prisma/client";

export function CreateDailyLogForm({ flocks, feedItems }: { flocks: Flock[]; feedItems: InventoryItem[] }) {
  const [error, formAction, pending] = useActionState(createDailyLogAction, undefined);
  const { t } = useI18n();
  const j = t.journal;

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.common.date}>
          <input
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className={`${inputClass} py-3 text-base`}
          />
        </Field>
        <Field label={j.flock}>
          <select name="flockId" required className={`${inputClass} py-3 text-base`}>
            <option value="">{j.selectFlock}</option>
            {flocks.map((flock) => (
              <option key={flock.id} value={flock.id}>
                {flock.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.eggsSection}</h3>
        <Field label={j.eggsCollected}>
          <input name="eggsCollected" type="number" min={0} defaultValue={0} className={`${inputClass} py-3 text-base`} />
        </Field>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.mortalitySection}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={j.mortalityCount}>
            <input name="mortalityCount" type="number" min={0} defaultValue={0} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.mortalityCause}>
            <input name="mortalityCause" placeholder={j.mortalityCausePlaceholder} className={`${inputClass} py-3 text-base`} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.feedSection}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={j.feedItem}>
            <select name="feedItemId" className={`${inputClass} py-3 text-base`}>
              <option value="">{j.selectItem}</option>
              {feedItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.unit})
                </option>
              ))}
            </select>
          </Field>
          <Field label={j.feedQuantity}>
            <input name="feedQuantity" type="number" min={0} step="any" defaultValue={0} className={`${inputClass} py-3 text-base`} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.healthSection}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={j.sickCount}>
            <input name="sickCount" type="number" min={0} defaultValue={0} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.sickNotes}>
            <input name="sickNotes" className={`${inputClass} py-3 text-base`} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.salesSection}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={j.eggsSold}>
            <input name="eggsSold" type="number" min={0} defaultValue={0} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.chicksSold}>
            <input name="chicksSold" type="number" min={0} defaultValue={0} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.saleAmount}>
            <input name="saleAmount" type="number" min={0} step="any" defaultValue={0} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.saleAmountAriary}>
            <input name="saleAmountAriary" type="number" min={0} step="any" defaultValue={0} className={`${inputClass} py-3 text-base`} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.weatherSection}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={j.weather}>
            <input name="weather" placeholder={j.weatherPlaceholder} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.notes}>
            <input name="notes" className={`${inputClass} py-3 text-base`} />
          </Field>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full py-3 text-base sm:w-auto">
        {pending ? j.saving : j.save}
      </Button>
    </form>
  );
}
