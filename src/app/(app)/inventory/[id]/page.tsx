import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
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
  const { t } = await getDictionary();
  const d = t.inventory.detail;

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
          ? `${d.purchasedBy} ${m.recordedBy}${m.extra ? ` ${d.from} ${m.extra}` : ""}`
          : `${d.usedBy} ${m.recordedBy}${m.extra ? ` ${d.forFlock} "${m.extra}"` : ` ${d.wholeFarm}`}`,
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
        description={`${t.inventory.types[item.type]} · ${d.trackedIn} ${item.unit}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{d.currentStock}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {item.currentStock} {item.unit}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{d.alertLevel}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {item.reorderLevel} {item.unit}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{d.status}</p>
          {isLowStock ? <Badge tone="amber">{t.inventory.lowStock}</Badge> : <Badge tone="green">{t.inventory.ok}</Badge>}
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">{d.editItem}</h2>
        <EditItemForm item={item} />
      </Card>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {d.correctStock}
        </h2>
        <p className="mb-4 text-xs text-stone-500 dark:text-stone-400">{d.correctStockHint}</p>
        <AdjustStockForm item={item} />
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">{d.stockLedger}</h2>
      {display.length === 0 ? (
        <EmptyState>{d.emptyLedger}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.common.date}</Th>
            <Th>{t.inventory.type}</Th>
            <Th>{d.change}</Th>
            <Th>{d.balance}</Th>
            <Th>{d.details}</Th>
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
