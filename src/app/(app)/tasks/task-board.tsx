"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Badge, Card, EmptyState, inputClass } from "@/components/ui";
import { TaskStatusSelect } from "./status-select";
import { useI18n } from "@/components/i18n-provider";
import type { Task, TaskGroup, TaskPriority, TaskResponsible } from "@prisma/client";

type GroupWithTasks = TaskGroup & { tasks: Task[] };

const PRIORITY_TONE: Record<TaskPriority, "red" | "amber" | "zinc"> = {
  HIGH: "red",
  MEDIUM: "amber",
  LOW: "zinc",
};

export function TaskBoard({ groups }: { groups: GroupWithTasks[] }) {
  const { t } = useI18n();
  const j = t.tasks;
  const [responsibleFilter, setResponsibleFilter] = useState<TaskResponsible | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Task["status"]>("ALL");

  const filteredGroups = useMemo(
    () =>
      groups.map((g) => ({
        ...g,
        visibleTasks: g.tasks.filter(
          (task) =>
            (responsibleFilter === "ALL" || task.responsible.includes(responsibleFilter)) &&
            (statusFilter === "ALL" || task.status === statusFilter)
        ),
      })),
    [groups, responsibleFilter, statusFilter]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={responsibleFilter}
          onChange={(e) => setResponsibleFilter(e.target.value as TaskResponsible | "ALL")}
          className={`${inputClass} w-auto`}
        >
          <option value="ALL">{j.allResponsible}</option>
          <option value="ALIX">{j.responsibleLabels.ALIX}</option>
          <option value="COPINE">{j.responsibleLabels.COPINE}</option>
          <option value="EMPLOYEE">{j.responsibleLabels.EMPLOYEE}</option>
          <option value="LOCAL">{j.responsibleLabels.LOCAL}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "ALL" | Task["status"])}
          className={`${inputClass} w-auto`}
        >
          <option value="ALL">{j.allStatuses}</option>
          <option value="TODO">{j.statusLabels.TODO}</option>
          <option value="IN_PROGRESS">{j.statusLabels.IN_PROGRESS}</option>
          <option value="DONE">{j.statusLabels.DONE}</option>
          <option value="BLOCKED">{j.statusLabels.BLOCKED}</option>
        </select>
      </div>

      <div className="space-y-6">
        {filteredGroups.map((group) => {
          const total = group.tasks.length;
          const done = group.tasks.filter((t) => t.status === "DONE").length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <Card key={group.id}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold text-stone-900 dark:text-stone-50">{group.name}</h2>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className={clsx("h-full rounded-full", pct === 100 ? "bg-emerald-600" : "bg-blue-500")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-xs text-stone-500">
                    {done}/{total} · {pct}% {j.progress}
                  </span>
                </div>
              </div>

              {group.visibleTasks.length === 0 ? (
                <EmptyState>{j.emptyState}</EmptyState>
              ) : (
                <div className="space-y-2">
                  {group.visibleTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col gap-2 rounded-xl border border-stone-200/80 p-3 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="font-medium text-stone-900 hover:underline dark:text-stone-100"
                        >
                          {task.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                          {task.responsible.map((r) => (
                            <Badge key={r} tone="blue">
                              {j.responsibleLabels[r]}
                            </Badge>
                          ))}
                          <Badge tone={PRIORITY_TONE[task.priority]}>{j.priorityLabels[task.priority]}</Badge>
                          {task.period && <span>{task.period}</span>}
                        </div>
                      </div>
                      <TaskStatusSelect taskId={task.id} status={task.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
