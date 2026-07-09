import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { EditItemForm } from "./edit-item-form";
import { AdjustStockForm } from "./adjust-stock-form";

type LedgerEntry = {
  date: Date;
  kind: "Purchase" | "Usage";
  quantity: number;
  detail: string;
  href: string;
};

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) notFound();

  const [purchases, usages] = await Promise.all([
    prisma.purchase.findMany({ where: { itemId: id }, orderBy: { date: "asc" }, include: { recordedBy: true } }),
    prisma.usage.findMany({
      where: { itemId: id },
      orderBy: { date: "asc" },
      include: { recordedBy: true, flock: true },
    }),
  ]);

  const movements = [
    ...purchases.map((p) => ({ date: p.date, kind: "Purchase" as const, delta: p.quantity, id: p.id, recordedBy: p.recordedBy.name, extra: p.supplier })),
    ...usages.map((u) => ({ date: u.date, kind: "Usage" as const, delta: -u.quantity, id: u.id, recordedBy: u.recordedBy.name, extra: u.flock?.name })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const ledger = movements.reduce<(LedgerEntry & { balance: number })[]>((acc, m) => {
    const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    acc.push({
      date: m.date,
      kind: m.kind,
      quantity: m.delta,
      detail:
        m.kind === "Purchase"
          ? `Purchased by ${m.recordedBy}${m.extra ? ` from ${m.extra}` : ""}`
          : `Used by ${m.recordedBy}${m.extra ? ` for flock "${m.extra}"` : " (whole farm)"}`,
      href: m.kind === "Purchase" ? `/inventory/purchases/${m.id}` : `/inventory/usage/${m.id}`,
      balance: prevBalance + m.delta,
    });
    return acc;
  }, []);

  const display = [...ledger].reverse();
  const isLowStock = item.currentStock <= item.reorderLevel;

  return (
    <div>
      <PageHeader
        title={item.name}
        description={`${item.type} · tracked in ${item.unit}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Current stock</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {item.currentStock} {item.unit}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Low stock alert level</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {item.reorderLevel} {item.unit}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Status</p>
          {isLowStock ? <Badge tone="amber">Low stock</Badge> : <Badge tone="green">OK</Badge>}
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">Edit item</h2>
        <EditItemForm item={item} />
      </Card>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          Correct stock level
        </h2>
        <p className="mb-4 text-xs text-stone-500 dark:text-stone-400">
          Use this if a physical count doesn&apos;t match the system (spillage, spoilage, counting
          error) — it will be recorded in the audit log.
        </p>
        <AdjustStockForm item={item} />
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">Stock ledger</h2>
      {display.length === 0 ? (
        <EmptyState>No purchases or usage recorded for this item yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Change</Th>
            <Th>Balance</Th>
            <Th>Details</Th>
            <Th></Th>
          </THead>
          <TBody>
            {display.map((entry, i) => (
              <tr key={i}>
                <Td className="whitespace-nowrap">{formatDate(entry.date)}</Td>
                <Td>
                  <Badge tone={entry.kind === "Purchase" ? "green" : "blue"}>{entry.kind}</Badge>
                </Td>
                <Td className={entry.quantity >= 0 ? "text-emerald-600" : "text-red-600"}>
                  {entry.quantity >= 0 ? "+" : ""}
                  {entry.quantity} {item.unit}
                </Td>
                <Td className="font-medium">
                  {entry.balance} {item.unit}
                </Td>
                <Td>{entry.detail}</Td>
                <Td>
                  <Link href={entry.href} className="text-emerald-700 hover:underline dark:text-emerald-400">
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
