"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { getDictionary } from "@/lib/i18n/locale";

const responsibleEnum = z.enum(["ALIX", "COPINE", "EMPLOYEE", "LOCAL"]);
const statusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]);
const priorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

const schema = z.object({
  groupId: z.string().min(1),
  title: z.string().min(1),
  responsible: z.array(responsibleEnum).default([]),
  priority: priorityEnum,
  period: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function createTaskAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = schema.safeParse({
    groupId: formData.get("groupId"),
    title: formData.get("title"),
    responsible: formData.getAll("responsible"),
    priority: formData.get("priority"),
    period: formData.get("period") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  const count = await prisma.task.count({ where: { groupId: parsed.data.groupId } });
  const { dueDate, ...rest } = parsed.data;

  const task = await prisma.task.create({
    data: { ...rest, dueDate: dueDate ? new Date(dueDate) : null, order: count },
    include: { group: true },
  });

  await logAudit({
    entity: "Task",
    entityId: task.id,
    action: "CREATE",
    summary: `Added task "${task.title}" to phase "${task.group.name}"`,
    userId: user.id,
  });

  revalidatePath("/tasks");
}

const updateSchema = schema.extend({ id: z.string().min(1) });

export async function updateTaskAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    groupId: formData.get("groupId"),
    title: formData.get("title"),
    responsible: formData.getAll("responsible"),
    priority: formData.get("priority"),
    period: formData.get("period") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  const { id, dueDate, ...data } = parsed.data;

  const task = await prisma.task.update({
    where: { id },
    data: { ...data, period: data.period ?? null, dueDate: dueDate ? new Date(dueDate) : null, notes: data.notes ?? null },
    include: { group: true },
  });

  await logAudit({
    entity: "Task",
    entityId: task.id,
    action: "UPDATE",
    summary: `Updated task "${task.title}"`,
    userId: user.id,
  });

  revalidatePath("/tasks");
}

export async function updateTaskStatusAction(taskId: string, formData: FormData) {
  const user = await requireUser();
  const status = statusEnum.parse(formData.get("status"));

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status },
    include: { group: true },
  });

  await logAudit({
    entity: "Task",
    entityId: task.id,
    action: "UPDATE",
    summary: `Task "${task.title}" marked ${status}`,
    userId: user.id,
  });

  revalidatePath("/tasks");
}

export async function deleteTaskAction(taskId: string) {
  const user = await requireUser();

  const task = await prisma.task.delete({ where: { id: taskId }, include: { group: true } });

  await logAudit({
    entity: "Task",
    entityId: task.id,
    action: "DELETE",
    summary: `Deleted task "${task.title}" from phase "${task.group.name}"`,
    userId: user.id,
  });

  revalidatePath("/tasks");
  redirect("/tasks");
}
