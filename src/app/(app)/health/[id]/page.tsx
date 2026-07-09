import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { EditHealthRecordForm } from "./edit-health-record-form";

export default async function EditHealthRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [record, flocks] = await Promise.all([
    prisma.healthRecord.findUnique({ where: { id } }),
    prisma.flock.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!record) notFound();

  return (
    <div>
      <PageHeader title="Edit Health Record" />
      <Card>
        <EditHealthRecordForm record={record} flocks={flocks} />
      </Card>
    </div>
  );
}
