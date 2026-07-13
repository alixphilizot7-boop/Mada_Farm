import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { EditUsageForm } from "./edit-usage-form";

export default async function EditUsagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getDictionary();

  const [usage, items, flocks] = await Promise.all([
    prisma.usage.findUnique({ where: { id } }),
    prisma.inventoryItem.findMany({ orderBy: { name: "asc" } }),
    prisma.flock.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!usage) notFound();

  return (
    <div>
      <PageHeader title={t.inventory.usagePage.editTitle} />
      <Card>
        <EditUsageForm usage={usage} items={items} flocks={flocks} />
      </Card>
    </div>
  );
}
