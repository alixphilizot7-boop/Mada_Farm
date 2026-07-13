import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
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
  const { t } = await getDictionary();

  const totalEggsSet = hatches.reduce((s, h) => s + h.eggsSet, 0);
  const totalHatched = hatches.reduce((s, h) => s + h.chicksHatched, 0);
  const avgHatchRate = totalEggsSet > 0 ? (totalHatched / totalEggsSet) * 100 : 0;

  return (
    <div>
      <PageHeader title={t.chicks.title} description={t.chicks.description} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{t.chicks.eggsSetRecent}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{totalEggsSet}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{t.chicks.chicksHatchedRecent}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{totalHatched}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{t.chicks.avgHatchRate}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{avgHatchRate.toFixed(0)}%</p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {t.chicks.logHatch}
        </h2>
        <CreateChickHatchForm flocks={flocks} />
      </Card>

      {hatches.length === 0 ? (
        <EmptyState>{t.chicks.emptyState}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.common.date}</Th>
            <Th>{t.chicks.eggsSet}</Th>
            <Th>{t.chicks.chicksHatched}</Th>
            <Th>{t.chicks.hatchRate}</Th>
            <Th>{t.chicks.flock}</Th>
            <Th>{t.common.notes}</Th>
            <Th>{t.common.recordedBy}</Th>
            <Th></Th>
          </THead>
          <TBody>
            {hatches.map((h) => (
              <tr key={h.id}>
                <Td className="whitespace-nowrap">{formatDate(h.date)}</Td>
                <Td>{h.eggsSet}</Td>
                <Td>{h.chicksHatched}</Td>
                <Td>{h.eggsSet > 0 ? `${((h.chicksHatched / h.eggsSet) * 100).toFixed(0)}%` : t.common.none}</Td>
                <Td>{h.flock?.name ?? t.chicks.unassigned}</Td>
                <Td>{h.notes ?? t.common.none}</Td>
                <Td>{h.recordedBy.name}</Td>
                <Td>
                  <Link href={`/chicks/${h.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
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
