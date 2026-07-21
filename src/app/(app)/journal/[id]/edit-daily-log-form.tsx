"use client";

import { useActionState } from "react";
import { updateDailyLogAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { toDateInputValue } from "@/lib/format";
import { useI18n } from "@/components/i18n-provider";
import type {
  CashTransaction,
  DailyLog,
  EggLog,
  Flock,
  HealthRecord,
  InventoryItem,
  MortalityLog,
  Usage,
} from "@prisma/client";

type FullDailyLog = DailyLog & {
  flock: Flock;
  eggLog: EggLog | null;
  mortalityLog: MortalityLog | null;
  usage: Usage | null;
  healthRecord: HealthRecord | null;
  cashTxn: CashTransaction | null;
};

export function EditDailyLogForm({ log, feedItems }: { log: FullDailyLog; feedItems: InventoryItem[] }) {
  const [error, formAction, pending] = useActionState(updateDailyLogAction, undefined);
  const { t } = useI18n();
  const j = t.journal;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={log.id} />
      <input type="hidden" name="flockId" value={log.flockId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.common.date}>
          <input name="date" type="date" required defaultValue={toDateInputValue(log.date)} className={`${inputClass} py-3 text-base`} />
        </Field>
        <Field label={j.flock}>
          <input value={log.flock.name} disabled className={`${inputClass} py-3 text-base opacity-70`} />
        </Field>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.eggsSection}</h3>
        <Field label={j.eggsCollected}>
          <input name="eggsCollected" type="number" min={0} defaultValue={log.eggLog?.wholeCount ?? 0} className={`${inputClass} py-3 text-base`} />
        </Field>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.mortalitySection}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={j.mortalityCount}>
            <input name="mortalityCount" type="number" min={0} defaultValue={log.mortalityLog?.quantity ?? 0} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.mortalityCause}>
            <input name="mortalityCause" placeholder={j.mortalityCausePlaceholder} defaultValue={log.mortalityLog?.cause ?? ""} className={`${inputClass} py-3 text-base`} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.feedSection}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={j.feedItem}>
            <select name="feedItemId" defaultValue={log.usage?.itemId ?? ""} className={`${inputClass} py-3 text-base`}>
              <option value="">{j.selectItem}</option>
              {feedItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.unit})
                </option>
              ))}
            </select>
          </Field>
          <Field label={j.feedQuantity}>
            <input name="feedQuantity" type="number" min={0} step="any" defaultValue={log.usage?.quantity ?? 0} className={`${inputClass} py-3 text-base`} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.healthSection}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={j.sickCount}>
            <input name="sickCount" type="number" min={0} defaultValue={log.healthRecord?.affectedCount ?? 0} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.sickNotes}>
            <input name="sickNotes" defaultValue={log.healthRecord?.diagnosis ?? ""} className={`${inputClass} py-3 text-base`} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.salesSection}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={j.eggsSold}>
            <input name="eggsSold" type="number" min={0} defaultValue={log.eggsSold ?? 0} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.chicksSold}>
            <input name="chicksSold" type="number" min={0} defaultValue={log.chicksSold ?? 0} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.saleAmount}>
            <input name="saleAmount" type="number" min={0} step="any" defaultValue={log.cashTxn?.amount ?? 0} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.saleAmountAriary}>
            <input name="saleAmountAriary" type="number" min={0} step="any" defaultValue={log.cashTxn?.amountAriary ?? 0} className={`${inputClass} py-3 text-base`} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{j.weatherSection}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={j.weather}>
            <input name="weather" placeholder={j.weatherPlaceholder} defaultValue={log.weather ?? ""} className={`${inputClass} py-3 text-base`} />
          </Field>
          <Field label={j.notes}>
            <input name="notes" defaultValue={log.notes ?? ""} className={`${inputClass} py-3 text-base`} />
          </Field>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full py-3 text-base sm:w-auto">
        {pending ? t.common.saving : t.common.saveChanges}
      </Button>
    </form>
  );
}
