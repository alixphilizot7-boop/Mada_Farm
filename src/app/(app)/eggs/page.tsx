import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { CreateEggLogForm } from "./create-egg-log-form";

export default async function EggsPage() {
  const [flocks, logs] = await Promise.all([
    prisma.flock.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.eggLog.findMany({
      orderBy: { date: "desc" },
      take: 100,
      include: { flock: true, recordedBy: true },
    }),
  ]);

  const totalWhole = logs.reduce((s, l) => s + l.wholeCount, 0);
  const totalBroken = logs.reduce((s, l) => s + l.brokenCount, 0);

  return (
    <div>
      <PageHeader
        title="Egg Production"
        description="Daily egg yield per flock."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Whole eggs (last 100 entries)</p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{totalWhole}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Broken eggs (last 100 entries)</p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{totalBroken}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Log today&apos;s collection
        </h2>
        {flocks.length === 0 ? (
          <EmptyState>Create a flock first before logging eggs.</EmptyState>
        ) : (
          <CreateEggLogForm flocks={flocks} />
        )}
      </Card>

      {logs.length === 0 ? (
        <EmptyState>No egg logs yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Flock</Th>
            <Th>Whole</Th>
            <Th>Broken</Th>
            <Th>Notes</Th>
            <Th>Logged by</Th>
            <Th></Th>
          </THead>
          <TBody>
            {logs.map((log) => (
              <tr key={log.id}>
                <Td className="whitespace-nowrap">{formatDate(log.date)}</Td>
                <Td>{log.flock.name}</Td>
                <Td>{log.wholeCount}</Td>
                <Td>{log.brokenCount}</Td>
                <Td>{log.notes ?? "—"}</Td>
                <Td>{log.recordedBy.name}</Td>
                <Td>
                  <Link href={`/eggs/${log.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
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
