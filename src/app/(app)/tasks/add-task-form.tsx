"use client";

import { useActionState } from "react";
import { createTaskAction } from "./actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { TaskGroup } from "@prisma/client";

export function AddTaskForm({ groups }: { groups: TaskGroup[] }) {
  const [error, formAction, pending] = useActionState(createTaskAction, undefined);
  const { t } = useI18n();
  const j = t.tasks;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label={j.group}>
        <select name="groupId" required className={inputClass}>
          <option value="">{j.selectGroup}</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2 lg:col-span-2">
        <Field label={j.task}>
          <input name="title" required className={inputClass} />
        </Field>
      </div>
      <Field label={j.priority}>
        <select name="priority" defaultValue="MEDIUM" className={inputClass}>
          <option value="HIGH">{j.priorityLabels.HIGH}</option>
          <option value="MEDIUM">{j.priorityLabels.MEDIUM}</option>
          <option value="LOW">{j.priorityLabels.LOW}</option>
        </select>
      </Field>

      <div className="sm:col-span-2 lg:col-span-4">
        <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">{j.responsible}</span>
        <div className="flex flex-wrap gap-4">
          {(["ALIX", "COPINE", "EMPLOYEE", "LOCAL"] as const).map((r) => (
            <label key={r} className="flex items-center gap-1.5 text-sm text-stone-700 dark:text-stone-300">
              <input type="checkbox" name="responsible" value={r} className="rounded border-stone-300" />
              {j.responsibleLabels[r]}
            </label>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <Field label={j.period}>
          <input name="period" placeholder={j.periodPlaceholder} className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label={j.notes}>
          <input name="notes" className={inputClass} />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? j.form.creating : j.form.create}
        </Button>
      </div>
    </form>
  );
}
