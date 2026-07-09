import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
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

  return (
    <div>
      <PageHeader title="Usage" description="Feed and water given to the chickens." />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          Log feed/water given
        </h2>
        {items.length === 0 ? (
          <EmptyState>Add an inventory item first on the Feed & Water page.</EmptyState>
        ) : (
          <CreateUsageForm items={items} flocks={flocks} />
        )}
      </Card>

      {usages.length === 0 ? (
        <EmptyState>No usage recorded yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Item</Th>
            <Th>Flock</Th>
            <Th>Quantity</Th>
            <Th>Notes</Th>
            <Th>Recorded by</Th>
            <Th></Th>
          </THead>
          <TBody>
            {usages.map((u) => (
              <tr key={u.id}>
                <Td className="whitespace-nowrap">{formatDate(u.date)}</Td>
                <Td>{u.item.name}</Td>
                <Td>{u.flock?.name ?? "Whole farm"}</Td>
                <Td>
                  {u.quantity} {u.item.unit}
                </Td>
                <Td>{u.notes ?? "—"}</Td>
                <Td>{u.recordedBy.name}</Td>
                <Td>
                  <Link href={`/inventory/usage/${u.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
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
