import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, LinkButton, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { TaskBoard } from "./task-board";
import { AddTaskForm } from "./add-task-form";

export default async function TasksPage() {
  const session = await auth();
  const isEmployee = session?.user.role === "EMPLOYEE";

  const [groups, allGroups] = await Promise.all([
    prisma.taskGroup.findMany({
      orderBy: { order: "asc" },
      include: { tasks: { orderBy: { order: "asc" } } },
    }),
    prisma.taskGroup.findMany({ orderBy: { order: "asc" } }),
  ]);
  const { t } = await getDictionary();
  const j = t.tasks;

  return (
    <div>
      <PageHeader
        title={j.title}
        description={j.description}
        action={<LinkButton href="/api/tasks/csv" variant="secondary">{j.exportCsv}</LinkButton>}
      />

      {!isEmployee && (
        <Card className="mb-6">
          <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">{j.addTask}</h2>
          <AddTaskForm groups={allGroups} />
        </Card>
      )}

      <TaskBoard groups={groups} canEditAll={!isEmployee} />
    </div>
  );
}
