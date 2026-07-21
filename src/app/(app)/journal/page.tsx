import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, LinkButton, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
import { CreateDailyLogForm } from "./daily-log-form";

export default async function JournalPage() {
  const session = await auth();
  const isEmployee = session?.user.role === "EMPLOYEE";

  const [flocks, feedItems, logs] = await Promise.all([
    prisma.flock.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.inventoryItem.findMany({ where: { type: "FEED" }, orderBy: { name: "asc" } }),
    prisma.dailyLog.findMany({
      orderBy: { date: "desc" },
      take: 100,
      include: {
        flock: true,
        eggLog: true,
        mortalityLog: true,
        usage: { include: { item: true } },
        healthRecord: true,
        cashTxn: true,
        recordedBy: true,
      },
    }),
  ]);
  const { t } = await getDictionary();
  const j = t.journal;

  return (
    <div>
      <PageHeader
        title={j.title}
        description={j.description}
        action={<LinkButton href="/api/journal/csv" variant="secondary">{j.exportCsv}</LinkButton>}
      />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">{j.logToday}</h2>
        {flocks.length === 0 ? (
          <EmptyState>{j.needFlockFirst}</EmptyState>
        ) : (
          <CreateDailyLogForm flocks={flocks} feedItems={feedItems} />
        )}
      </Card>

      {logs.length === 0 ? (
        <EmptyState>{j.emptyState}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{j.date}</Th>
            <Th>{j.flock}</Th>
            <Th>{j.eggs}</Th>
            <Th>{j.mortality}</Th>
            <Th>{j.feed}</Th>
            <Th>{j.sick}</Th>
            <Th>{j.sales}</Th>
            <Th>{j.weatherCol}</Th>
            <Th>{j.recordedBy}</Th>
            {!isEmployee && <Th></Th>}
          </THead>
          <TBody>
            {logs.map((log) => (
              <tr key={log.id}>
                <Td className="whitespace-nowrap">{formatDate(log.date)}</Td>
                <Td>{log.flock.name}</Td>
                <Td>{log.eggLog ? log.eggLog.wholeCount : t.common.none}</Td>
                <Td>{log.mortalityLog ? log.mortalityLog.quantity : t.common.none}</Td>
                <Td>{log.usage ? `${log.usage.quantity} ${log.usage.item.unit}` : t.common.none}</Td>
                <Td>{log.healthRecord ? log.healthRecord.affectedCount : t.common.none}</Td>
                <Td>{log.cashTxn ? formatMoney(log.cashTxn.amount) : t.common.none}</Td>
                <Td>{log.weather ?? t.common.none}</Td>
                <Td>{log.recordedBy.name}</Td>
                {!isEmployee && (
                  <Td>
                    <Link href={`/journal/${log.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      {t.common.edit}
                    </Link>
                  </Td>
                )}
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
