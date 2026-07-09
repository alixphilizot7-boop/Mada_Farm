import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { CreateMortalityForm } from "./create-mortality-form";

export default async function MortalityPage() {
  const [flocks, logs] = await Promise.all([
    prisma.flock.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.mortalityLog.findMany({
      orderBy: { date: "desc" },
      take: 100,
      include: { flock: true, recordedBy: true },
    }),
  ]);

  const totalLost = logs.reduce((s, l) => s + l.quantity, 0);

  return (
    <div>
      <PageHeader title="Mortality" description="Track losses so you can trace back causes and trends." />

      <Card className="mb-6">
        <p className="text-xs text-stone-500 dark:text-stone-400">Total lost (last 100 entries)</p>
        <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{totalLost}</p>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          Log a loss
        </h2>
        {flocks.length === 0 ? (
          <EmptyState>Create a flock first before logging losses.</EmptyState>
        ) : (
          <CreateMortalityForm flocks={flocks} />
        )}
      </Card>

      {logs.length === 0 ? (
        <EmptyState>No losses recorded yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Flock</Th>
            <Th>Quantity</Th>
            <Th>Cause</Th>
            <Th>Notes</Th>
            <Th>Recorded by</Th>
            <Th></Th>
          </THead>
          <TBody>
            {logs.map((log) => (
              <tr key={log.id}>
                <Td className="whitespace-nowrap">{formatDate(log.date)}</Td>
                <Td>{log.flock.name}</Td>
                <Td>{log.quantity}</Td>
                <Td>{log.cause ?? "—"}</Td>
                <Td>{log.notes ?? "—"}</Td>
                <Td>
                  {log.healthRecordId ? <Badge tone="blue">via Health</Badge> : log.recordedBy.name}
                </Td>
                <Td>
                  <Link href={`/mortality/${log.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
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
