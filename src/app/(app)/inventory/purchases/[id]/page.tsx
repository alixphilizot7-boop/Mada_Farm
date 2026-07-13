import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { EditPurchaseForm } from "./edit-purchase-form";

export default async function EditPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getDictionary();

  const [purchase, items] = await Promise.all([
    prisma.purchase.findUnique({ where: { id } }),
    prisma.inventoryItem.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!purchase) notFound();

  return (
    <div>
      <PageHeader title={t.inventory.purchasesPage.editTitle} />
      <Card>
        <EditPurchaseForm purchase={purchase} items={items} />
      </Card>
    </div>
  );
}
