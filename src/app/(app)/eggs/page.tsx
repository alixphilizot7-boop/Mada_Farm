import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
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
  const { t } = await getDictionary();

  const totalWhole = logs.reduce((s, l) => s + l.wholeCount, 0);
  const totalBroken = logs.reduce((s, l) => s + l.brokenCount, 0);

  return (
    <div>
      <PageHeader title={t.eggs.title} description={t.eggs.description} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{t.eggs.wholeEggsRecent}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{totalWhole}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{t.eggs.brokenEggsRecent}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{totalBroken}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {t.eggs.logToday}
        </h2>
        {flocks.length === 0 ? (
          <EmptyState>{t.eggs.needFlockFirst}</EmptyState>
        ) : (
          <CreateEggLogForm flocks={flocks} />
        )}
      </Card>

      {logs.length === 0 ? (
        <EmptyState>{t.eggs.emptyState}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.common.date}</Th>
            <Th>{t.eggs.flock}</Th>
            <Th>{t.eggs.whole}</Th>
            <Th>{t.eggs.broken}</Th>
            <Th>{t.common.notes}</Th>
            <Th>{t.eggs.loggedBy}</Th>
            <Th></Th>
          </THead>
          <TBody>
            {logs.map((log) => (
              <tr key={log.id}>
                <Td className="whitespace-nowrap">{formatDate(log.date)}</Td>
                <Td>{log.flock.name}</Td>
                <Td>{log.wholeCount}</Td>
                <Td>{log.brokenCount}</Td>
                <Td>{log.notes ?? t.common.none}</Td>
                <Td>{log.recordedBy.name}</Td>
                <Td>
                  <Link href={`/eggs/${log.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
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
