"use client";

import { useActionState } from "react";
import { updateTaskAction, deleteTaskAction } from "../actions";
import { Button, Field, inputClass } from "@/components/ui";
import { useI18n } from "@/components/i18n-provider";
import type { Task, TaskGroup } from "@prisma/client";

export function EditTaskForm({ task, groups }: { task: Task; groups: TaskGroup[] }) {
  const [error, formAction, pending] = useActionState(updateTaskAction, undefined);
  const { t } = useI18n();
  const j = t.tasks;

  return (
    <div className="space-y-6">
      <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <input type="hidden" name="id" value={task.id} />
        <Field label={j.group}>
          <select name="groupId" required defaultValue={task.groupId} className={inputClass}>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2 lg:col-span-2">
          <Field label={j.task}>
            <input name="title" required defaultValue={task.title} className={inputClass} />
          </Field>
        </div>
        <Field label={j.priority}>
          <select name="priority" defaultValue={task.priority} className={inputClass}>
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
                <input
                  type="checkbox"
                  name="responsible"
                  value={r}
                  defaultChecked={task.responsible.includes(r)}
                  className="rounded border-stone-300"
                />
                {j.responsibleLabels[r]}
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <Field label={j.period}>
            <input name="period" placeholder={j.periodPlaceholder} defaultValue={task.period ?? ""} className={inputClass} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label={j.notes}>
            <input name="notes" defaultValue={task.notes ?? ""} className={inputClass} />
          </Field>
        </div>

        {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? j.form.saving : j.form.save}
          </Button>
        </div>
      </form>

      <form
        action={deleteTaskAction.bind(null, task.id)}
        onSubmit={(e) => {
          if (!confirm(j.deleteConfirm)) e.preventDefault();
        }}
      >
        <Button type="submit" variant="danger">
          {j.delete}
        </Button>
      </form>
    </div>
  );
}
