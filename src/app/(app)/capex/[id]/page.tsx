import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { EditItemForm } from "./edit-item-form";
import { RecordPurchaseForm } from "../record-purchase-form";
import { MarkOrderedButton, UndoPurchaseButton } from "../status-buttons";

const STATUS_TONE = {
  PLANNED: "zinc",
  ORDERED: "blue",
  PURCHASED: "green",
} as const;

export default async function CapexItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const item = await prisma.capexItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <PageHeader title={item.name} description={item.category} />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
        {item.status === "PLANNED" && <MarkOrderedButton id={item.id} />}
        {item.status !== "PURCHASED" && <RecordPurchaseForm item={item} />}
        {item.status === "PURCHASED" && <UndoPurchaseButton id={item.id} />}
      </div>

      {item.status === "PURCHASED" && (
        <Card className="mb-6">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Actually paid</p>
          <p className="text-xl font-semibold text-emerald-600">
            {item.actualQuantity} × {formatMoney(item.actualUnitCost ?? 0)} = {formatMoney(item.actualTotal ?? 0)}
          </p>
          {item.purchaseDate && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">on {formatDate(item.purchaseDate)}</p>
          )}
        </Card>
      )}

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Edit item</h2>
        <EditItemForm item={item} />
      </Card>
    </div>
  );
}
