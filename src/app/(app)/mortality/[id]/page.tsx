import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { EditMortalityForm } from "./edit-mortality-form";

export default async function EditMortalityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [log, flocks] = await Promise.all([
    prisma.mortalityLog.findUnique({ where: { id } }),
    prisma.flock.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!log) notFound();

  return (
    <div>
      <PageHeader title="Edit Mortality Record" />
      <Card>
        {log.healthRecordId ? (
          <p className="text-sm text-stone-600 dark:text-stone-300">
            This loss was auto-logged from a health record.{" "}
            <Link href={`/health/${log.healthRecordId}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
              Edit the health record instead
            </Link>
            .
          </p>
        ) : (
          <EditMortalityForm log={log} flocks={flocks} />
        )}
      </Card>
    </div>
  );
}
