import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/require-user";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";

function csvCell(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return new Response("Unauthorized", { status: 403 });
    throw error;
  }

  const { t } = await getDictionary();

  const logs = await prisma.dailyLog.findMany({
    orderBy: { date: "asc" },
    include: {
      flock: true,
      eggLog: true,
      mortalityLog: true,
      usage: { include: { item: true } },
      healthRecord: true,
      cashTxn: true,
      recordedBy: true,
    },
  });

  const header = t.journal.csvHeaders;

  const rows = logs.map((log) => [
    formatDate(log.date),
    log.flock.name,
    log.eggLog?.wholeCount ?? "",
    log.mortalityLog?.quantity ?? "",
    log.mortalityLog?.cause ?? "",
    log.usage?.item.name ?? "",
    log.usage?.quantity ?? "",
    log.healthRecord?.affectedCount ?? "",
    log.healthRecord?.diagnosis ?? "",
    log.eggsSold ?? "",
    log.chicksSold ?? "",
    log.cashTxn?.amount ?? "",
    log.cashTxn?.amountAriary ?? "",
    log.weather ?? "",
    log.notes ?? "",
    log.recordedBy.name,
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mada-farm-journal.csv"`,
    },
  });
}
