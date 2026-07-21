"use client";

import { clsx } from "clsx";
import { updateTaskStatusAction } from "./actions";
import { useI18n } from "@/components/i18n-provider";
import type { TaskStatus } from "@prisma/client";

const STATUS_CLASSES: Record<TaskStatus, string> = {
  TODO: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  BLOCKED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export function TaskStatusSelect({ taskId, status }: { taskId: string; status: TaskStatus }) {
  const { t } = useI18n();
  const labels = t.tasks.statusLabels;

  return (
    <form action={updateTaskStatusAction.bind(null, taskId)}>
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={clsx(
          "rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500",
          STATUS_CLASSES[status]
        )}
      >
        <option value="TODO">{labels.TODO}</option>
        <option value="IN_PROGRESS">{labels.IN_PROGRESS}</option>
        <option value="DONE">{labels.DONE}</option>
        <option value="BLOCKED">{labels.BLOCKED}</option>
      </select>
    </form>
  );
}
