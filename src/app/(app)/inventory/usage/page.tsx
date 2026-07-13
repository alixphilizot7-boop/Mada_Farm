import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
import { CreateUsageForm } from "./create-usage-form";

export default async function UsagePage() {
  const [items, flocks, usages] = await Promise.all([
    prisma.inventoryItem.findMany({ orderBy: { name: "asc" } }),
    prisma.flock.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.usage.findMany({
      orderBy: { date: "desc" },
      take: 100,
      include: { item: true, flock: true, recordedBy: true },
    }),
  ]);
  const { t } = await getDictionary();
  const u = t.inventory.usagePage;

  return (
    <div>
      <PageHeader title={u.title} description={u.description} />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {u.logGiven}
        </h2>
        {items.length === 0 ? (
          <EmptyState>{u.needItemFirst}</EmptyState>
        ) : (
          <CreateUsageForm items={items} flocks={flocks} />
        )}
      </Card>

      {usages.length === 0 ? (
        <EmptyState>{u.emptyState}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.common.date}</Th>
            <Th>{t.inventory.item}</Th>
            <Th>{u.flock}</Th>
            <Th>{t.common.quantity}</Th>
            <Th>{t.common.notes}</Th>
            <Th>{t.common.recordedBy}</Th>
            <Th></Th>
          </THead>
          <TBody>
            {usages.map((us) => (
              <tr key={us.id}>
                <Td className="whitespace-nowrap">{formatDate(us.date)}</Td>
                <Td>{us.item.name}</Td>
                <Td>{us.flock?.name ?? u.wholeFarm}</Td>
                <Td>
                  {us.quantity} {us.item.unit}
                </Td>
                <Td>{us.notes ?? t.common.none}</Td>
                <Td>{us.recordedBy.name}</Td>
                <Td>
                  <Link href={`/inventory/usage/${us.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
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
