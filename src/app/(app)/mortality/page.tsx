import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
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
  const { t } = await getDictionary();

  const totalLost = logs.reduce((s, l) => s + l.quantity, 0);

  return (
    <div>
      <PageHeader title={t.mortality.title} description={t.mortality.description} />

      <Card className="mb-6">
        <p className="text-xs text-stone-500 dark:text-stone-400">{t.mortality.totalLostRecent}</p>
        <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{totalLost}</p>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {t.mortality.logLoss}
        </h2>
        {flocks.length === 0 ? (
          <EmptyState>{t.mortality.needFlockFirst}</EmptyState>
        ) : (
          <CreateMortalityForm flocks={flocks} />
        )}
      </Card>

      {logs.length === 0 ? (
        <EmptyState>{t.mortality.emptyState}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.common.date}</Th>
            <Th>{t.mortality.flock}</Th>
            <Th>{t.common.quantity}</Th>
            <Th>{t.mortality.cause}</Th>
            <Th>{t.common.notes}</Th>
            <Th>{t.common.recordedBy}</Th>
            <Th></Th>
          </THead>
          <TBody>
            {logs.map((log) => (
              <tr key={log.id}>
                <Td className="whitespace-nowrap">{formatDate(log.date)}</Td>
                <Td>{log.flock.name}</Td>
                <Td>{log.quantity}</Td>
                <Td>{log.cause ?? t.common.none}</Td>
                <Td>{log.notes ?? t.common.none}</Td>
                <Td>
                  {log.healthRecordId ? <Badge tone="blue">{t.mortality.viaHealth}</Badge> : log.recordedBy.name}
                </Td>
                <Td>
                  <Link href={`/mortality/${log.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
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
