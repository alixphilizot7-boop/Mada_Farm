import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
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

  return (
    <div>
      <PageHeader title="Purchases" description="Feed, water and supplies bought for the flocks." />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Record a purchase
        </h2>
        {items.length === 0 ? (
          <EmptyState>Add an inventory item first on the Feed & Water page.</EmptyState>
        ) : (
          <CreatePurchaseForm items={items} />
        )}
      </Card>

      {purchases.length === 0 ? (
        <EmptyState>No purchases recorded yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Item</Th>
            <Th>Quantity</Th>
            <Th>Unit cost</Th>
            <Th>Total</Th>
            <Th>Supplier</Th>
            <Th>Recorded by</Th>
            <Th></Th>
          </THead>
          <TBody>
            {purchases.map((p) => (
              <tr key={p.id}>
                <Td className="whitespace-nowrap">{formatDate(p.date)}</Td>
                <Td>{p.item.name}</Td>
                <Td>
                  {p.quantity} {p.item.unit}
                </Td>
                <Td>{formatMoney(p.unitCost)}</Td>
                <Td>{formatMoney(p.totalCost)}</Td>
                <Td>{p.supplier ?? "—"}</Td>
                <Td>{p.recordedBy.name}</Td>
                <Td>
                  <Link href={`/inventory/purchases/${p.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    Edit
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
