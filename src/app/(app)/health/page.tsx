import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { CreateHealthRecordForm } from "./create-health-record-form";

const OUTCOME_TONE = {
  RECOVERED: "green",
  ONGOING: "amber",
  DECEASED: "red",
} as const;

export default async function HealthPage() {
  const [flocks, records] = await Promise.all([
    prisma.flock.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.healthRecord.findMany({
      orderBy: { date: "desc" },
      take: 100,
      include: { flock: true },
    }),
  ]);

  return (
    <div>
      <PageHeader title="Health" description="Illness, treatment, vaccination and checkup records." />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          Log a health event
        </h2>
        {flocks.length === 0 ? (
          <EmptyState>Create a flock first before logging health records.</EmptyState>
        ) : (
          <CreateHealthRecordForm flocks={flocks} />
        )}
      </Card>

      {records.length === 0 ? (
        <EmptyState>No health records yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Flock</Th>
            <Th>Type</Th>
            <Th>Affected</Th>
            <Th>Diagnosis / Treatment</Th>
            <Th>Cost</Th>
            <Th>Outcome</Th>
            <Th></Th>
          </THead>
          <TBody>
            {records.map((r) => (
              <tr key={r.id}>
                <Td className="whitespace-nowrap">{formatDate(r.date)}</Td>
                <Td>{r.flock.name}</Td>
                <Td>{r.type}</Td>
                <Td>{r.affectedCount}</Td>
                <Td>{[r.diagnosis, r.treatment].filter(Boolean).join(" — ") || "—"}</Td>
                <Td>{r.cost > 0 ? formatMoney(r.cost) : "—"}</Td>
                <Td>
                  <Badge tone={OUTCOME_TONE[r.outcome]}>{r.outcome}</Badge>
                </Td>
                <Td>
                  <Link href={`/health/${r.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
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
