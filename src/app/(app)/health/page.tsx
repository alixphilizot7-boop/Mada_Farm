import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
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
  const { t } = await getDictionary();

  return (
    <div>
      <PageHeader title={t.health.title} description={t.health.description} />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {t.health.logEvent}
        </h2>
        {flocks.length === 0 ? (
          <EmptyState>{t.health.needFlockFirst}</EmptyState>
        ) : (
          <CreateHealthRecordForm flocks={flocks} />
        )}
      </Card>

      {records.length === 0 ? (
        <EmptyState>{t.health.emptyState}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.common.date}</Th>
            <Th>{t.health.flock}</Th>
            <Th>{t.health.type}</Th>
            <Th>{t.health.affected}</Th>
            <Th>{t.health.diagnosisTreatment}</Th>
            <Th>{t.health.cost}</Th>
            <Th>{t.health.outcome}</Th>
            <Th></Th>
          </THead>
          <TBody>
            {records.map((r) => (
              <tr key={r.id}>
                <Td className="whitespace-nowrap">{formatDate(r.date)}</Td>
                <Td>{r.flock.name}</Td>
                <Td>{t.health.types[r.type]}</Td>
                <Td>{r.affectedCount}</Td>
                <Td>{[r.diagnosis, r.treatment].filter(Boolean).join(" — ") || t.common.none}</Td>
                <Td>{r.cost > 0 ? formatMoney(r.cost) : t.common.none}</Td>
                <Td>
                  <Badge tone={OUTCOME_TONE[r.outcome]}>{t.health.outcomes[r.outcome]}</Badge>
                </Td>
                <Td>
                  <Link href={`/health/${r.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
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
