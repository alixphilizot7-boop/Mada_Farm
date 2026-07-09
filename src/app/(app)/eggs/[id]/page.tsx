import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { EditEggLogForm } from "./edit-egg-log-form";

export default async function EditEggLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [log, flocks] = await Promise.all([
    prisma.eggLog.findUnique({ where: { id } }),
    prisma.flock.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!log) notFound();

  return (
    <div>
      <PageHeader title="Edit Egg Log" />
      <Card>
        <EditEggLogForm log={log} flocks={flocks} />
      </Card>
    </div>
  );
}
