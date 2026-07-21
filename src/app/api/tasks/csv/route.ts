import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/require-user";

function csvCell(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return new Response("Unauthorized", { status: 403 });
    throw error;
  }

  const groups = await prisma.taskGroup.findMany({
    orderBy: { order: "asc" },
    include: { tasks: { orderBy: { order: "asc" } } },
  });

  const header = ["Phase", "Task", "Responsible", "Status", "Priority", "Due / period", "Notes"];

  const rows = groups.flatMap((group) =>
    group.tasks.map((task) => [
      group.name,
      task.title,
      task.responsible.join("/"),
      task.status,
      task.priority,
      task.period ?? "",
      task.notes ?? "",
    ])
  );

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mada-farm-action-plan.csv"`,
    },
  });
}
