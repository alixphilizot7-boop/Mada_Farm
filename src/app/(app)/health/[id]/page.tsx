import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { EditHealthRecordForm } from "./edit-health-record-form";

export default async function EditHealthRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getDictionary();

  const [record, flocks] = await Promise.all([
    prisma.healthRecord.findUnique({ where: { id } }),
    prisma.flock.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!record) notFound();

  return (
    <div>
      <PageHeader title={t.health.editTitle} />
      <Card>
        <EditHealthRecordForm record={record} flocks={flocks} />
      </Card>
    </div>
  );
}
