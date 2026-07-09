import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/format";
import { EditFlockForm } from "./edit-flock-form";

const STATUS_TONE = {
  ACTIVE: "green",
  SOLD_OUT: "amber",
  CLOSED: "zinc",
} as const;

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

  const timeline: TimelineEntry[] = [
    ...eggLogs.map((e) => ({
      date: e.date,
      kind: "Egg log",
      tone: "amber" as const,
      summary: `${e.wholeCount} eggs collected${e.brokenCount ? `, ${e.brokenCount} broken` : ""}`,
    })),
    ...usages.map((u) => ({
      date: u.date,
      kind: "Feed/Water",
      tone: "blue" as const,
      summary: `${u.quantity} ${u.item.unit} of ${u.item.name} given to the flock`,
    })),
    ...healthRecords.map((h) => ({
      date: h.date,
      kind: "Health",
      tone: "red" as const,
      summary: `${h.type.toLowerCase()}${h.diagnosis ? `: ${h.diagnosis}` : ""} (${h.outcome.toLowerCase()})`,
    })),
    ...mortalityLogs.map((m) => ({
      date: m.date,
      kind: "Mortality",
      tone: "red" as const,
      summary: `${m.quantity} lost${m.cause ? ` — ${m.cause}` : ""}`,
    })),
    ...chickHatches.map((h) => ({
      date: h.date,
      kind: "Chick hatch",
      tone: "green" as const,
      summary: `${h.chicksHatched} chicks hatched from ${h.eggsSet} eggs added to this flock`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div>
      <PageHeader
        title={flock.name}
        description={`${flock.breed ?? "Unspecified breed"} · started ${formatDate(flock.startDate)}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Status</p>
          <Badge tone={STATUS_TONE[flock.status]}>{flock.status.replace("_", " ")}</Badge>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Current headcount</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {flock.currentCount} <span className="text-sm font-normal text-stone-400">/ {flock.initialCount}</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Eggs collected (recent)</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{totalEggs}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Lost (recent)</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{totalLost}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">Edit flock</h2>
        <EditFlockForm flock={flock} />
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">
        Activity timeline
      </h2>
      {timeline.length === 0 ? (
        <EmptyState>No activity logged for this flock yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Details</Th>
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
