import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
import { CreatePurchaseForm } from "./create-purchase-form";

export default async function PurchasesPage() {
  const [items, purchases] = await Promise.all([
    prisma.inventoryItem.findMany({ orderBy: { name: "asc" } }),
    prisma.purchase.findMany({
      orderBy: { date: "desc" },
      take: 100,
      include: { item: true, recordedBy: true },
    }),
  ]);
  const { t } = await getDictionary();
  const p = t.inventory.purchasesPage;

  return (
    <div>
      <PageHeader title={p.title} description={p.description} />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {p.recordPurchase}
        </h2>
        {items.length === 0 ? (
          <EmptyState>{p.needItemFirst}</EmptyState>
        ) : (
          <CreatePurchaseForm items={items} />
        )}
      </Card>

      {purchases.length === 0 ? (
        <EmptyState>{p.emptyState}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.common.date}</Th>
            <Th>{t.inventory.item}</Th>
            <Th>{t.common.quantity}</Th>
            <Th>{p.unitCost}</Th>
            <Th>{t.common.total}</Th>
            <Th>{t.common.supplier}</Th>
            <Th>{t.common.recordedBy}</Th>
            <Th></Th>
          </THead>
          <TBody>
            {purchases.map((pu) => (
              <tr key={pu.id}>
                <Td className="whitespace-nowrap">{formatDate(pu.date)}</Td>
                <Td>{pu.item.name}</Td>
                <Td>
                  {pu.quantity} {pu.item.unit}
                </Td>
                <Td>{formatMoney(pu.unitCost)}</Td>
                <Td>{formatMoney(pu.totalCost)}</Td>
                <Td>{pu.supplier ?? t.common.none}</Td>
                <Td>{pu.recordedBy.name}</Td>
                <Td>
                  <Link href={`/inventory/purchases/${pu.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    {t.common.edit}
                  </Link>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
