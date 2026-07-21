import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { EditTaskForm } from "./edit-task-form";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getDictionary();

  const [task, groups] = await Promise.all([
    prisma.task.findUnique({ where: { id } }),
    prisma.taskGroup.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!task) notFound();

  return (
    <div>
      <PageHeader title={t.tasks.editTitle} />
      <Card>
        <EditTaskForm task={task} groups={groups} />
      </Card>
    </div>
  );
}
