import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
import { EditFlockForm } from "./edit-flock-form";

type TimelineEntry = {
  date: Date;
  kind: string;
  tone: "green" | "red" | "amber" | "blue" | "zinc";
  summary: string;
};

export default async function FlockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getDictionary();

  const STATUS_TONE = {
    ACTIVE: "green",
    SOLD_OUT: "amber",
    CLOSED: "zinc",
  } as const;

  const STATUS_LABEL = {
    ACTIVE: t.flocks.statusActive,
    SOLD_OUT: t.flocks.statusSoldOut,
    CLOSED: t.flocks.statusClosed,
  } as const;

  const flock = await prisma.flock.findUnique({ where: { id } });
  if (!flock) notFound();

  const [eggLogs, usages, healthRecords, mortalityLogs, chickHatches] = await Promise.all([
    prisma.eggLog.findMany({ where: { flockId: id }, orderBy: { date: "desc" }, take: 20 }),
    prisma.usage.findMany({
      where: { flockId: id },
      orderBy: { date: "desc" },
      take: 20,
      include: { item: true },
    }),
    prisma.healthRecord.findMany({ where: { flockId: id }, orderBy: { date: "desc" }, take: 20 }),
    prisma.mortalityLog.findMany({ where: { flockId: id }, orderBy: { date: "desc" }, take: 20 }),
    prisma.chickHatch.findMany({ where: { flockId: id }, orderBy: { date: "desc" }, take: 20 }),
  ]);

  const totalEggs = eggLogs.reduce((sum, e) => sum + e.wholeCount, 0);
  const totalLost = mortalityLogs.reduce((sum, m) => sum + m.quantity, 0);
  const d = t.flocks.detail;

  const timeline: TimelineEntry[] = [
    ...eggLogs.map((e) => ({
      date: e.date,
      kind: d.eggLog,
      tone: "amber" as const,
      summary: `${e.wholeCount} ${d.eggsCollected}${e.brokenCount ? `, ${e.brokenCount} ${d.broken}` : ""}`,
    })),
    ...usages.map((u) => ({
      date: u.date,
      kind: d.feedWater,
      tone: "blue" as const,
      summary: `${u.quantity} ${u.item.unit} ${u.item.name} ${d.givenToFlock}`,
    })),
    ...healthRecords.map((h) => ({
      date: h.date,
      kind: d.health,
      tone: "red" as const,
      summary: `${h.type.toLowerCase()}${h.diagnosis ? `: ${h.diagnosis}` : ""} (${h.outcome.toLowerCase()})`,
    })),
    ...mortalityLogs.map((m) => ({
      date: m.date,
      kind: d.mortality,
      tone: "red" as const,
      summary: `${m.quantity} ${d.lost}${m.cause ? ` — ${m.cause}` : ""}`,
    })),
    ...chickHatches.map((h) => ({
      date: h.date,
      kind: d.chickHatch,
      tone: "green" as const,
      summary: `${h.chicksHatched} ${d.chicksHatchedFrom} ${h.eggsSet} ${d.eggsAddedToFlock}`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div>
      <PageHeader
        title={flock.name}
        description={`${flock.breed ?? d.unspecifiedBreed} · ${d.started} ${formatDate(flock.startDate)}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{t.common.status}</p>
          <Badge tone={STATUS_TONE[flock.status]}>{STATUS_LABEL[flock.status]}</Badge>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{d.currentHeadcount}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {flock.currentCount} <span className="text-sm font-normal text-stone-400">/ {flock.initialCount}</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{d.eggsCollectedRecent}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{totalEggs}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{d.lostRecent}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{totalLost}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">{d.editFlock}</h2>
        <EditFlockForm flock={flock} />
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">
        {d.activityTimeline}
      </h2>
      {timeline.length === 0 ? (
        <EmptyState>{d.noActivity}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.common.date}</Th>
            <Th>{d.type}</Th>
            <Th>{d.details}</Th>
          </THead>
          <TBody>
            {timeline.slice(0, 40).map((entry, i) => (
              <tr key={i}>
                <Td className="whitespace-nowrap">{formatDateTime(entry.date)}</Td>
                <Td>
                  <Badge tone={entry.tone}>{entry.kind}</Badge>
                </Td>
                <Td>{entry.summary}</Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
