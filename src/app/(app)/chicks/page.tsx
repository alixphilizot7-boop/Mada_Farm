import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { CreateChickHatchForm } from "./create-chick-hatch-form";

export default async function ChicksPage() {
  const [flocks, hatches] = await Promise.all([
    prisma.flock.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.chickHatch.findMany({
      orderBy: { date: "desc" },
      take: 100,
      include: { flock: true, recordedBy: true },
    }),
  ]);

  const totalEggsSet = hatches.reduce((s, h) => s + h.eggsSet, 0);
  const totalHatched = hatches.reduce((s, h) => s + h.chicksHatched, 0);
  const avgHatchRate = totalEggsSet > 0 ? (totalHatched / totalEggsSet) * 100 : 0;

  return (
    <div>
      <PageHeader
        title="Chick Production"
        description="Incubator hatches — eggs set, chicks hatched, and the flock they join."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Eggs set (last 100 entries)</p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{totalEggsSet}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Chicks hatched (last 100 entries)</p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{totalHatched}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Average hatch rate</p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{avgHatchRate.toFixed(0)}%</p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Log a hatch
        </h2>
        <CreateChickHatchForm flocks={flocks} />
      </Card>

      {hatches.length === 0 ? (
        <EmptyState>No hatches recorded yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Eggs set</Th>
            <Th>Chicks hatched</Th>
            <Th>Hatch rate</Th>
            <Th>Flock</Th>
            <Th>Notes</Th>
            <Th>Recorded by</Th>
            <Th></Th>
          </THead>
          <TBody>
            {hatches.map((h) => (
              <tr key={h.id}>
                <Td className="whitespace-nowrap">{formatDate(h.date)}</Td>
                <Td>{h.eggsSet}</Td>
                <Td>{h.chicksHatched}</Td>
                <Td>{h.eggsSet > 0 ? `${((h.chicksHatched / h.eggsSet) * 100).toFixed(0)}%` : "—"}</Td>
                <Td>{h.flock?.name ?? "Unassigned"}</Td>
                <Td>{h.notes ?? "—"}</Td>
                <Td>{h.recordedBy.name}</Td>
                <Td>
                  <Link href={`/chicks/${h.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
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
