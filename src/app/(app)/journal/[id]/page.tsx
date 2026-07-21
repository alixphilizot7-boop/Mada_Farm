import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { EditDailyLogForm } from "./edit-daily-log-form";

export default async function EditJournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getDictionary();

  const [log, feedItems] = await Promise.all([
    prisma.dailyLog.findUnique({
      where: { id },
      include: { flock: true, eggLog: true, mortalityLog: true, usage: true, healthRecord: true, cashTxn: true },
    }),
    prisma.inventoryItem.findMany({ where: { type: "FEED" }, orderBy: { name: "asc" } }),
  ]);
  if (!log) notFound();

  return (
    <div>
      <PageHeader title={t.journal.editTitle} description={log.flock.name} />
      <Card>
        <EditDailyLogForm log={log} feedItems={feedItems} />
      </Card>
    </div>
  );
}
