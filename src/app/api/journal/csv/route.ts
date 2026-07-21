import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/require-user";
import { formatDate } from "@/lib/format";

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

  const header = [
    "Date",
    "Flock",
    "Eggs collected",
    "Birds lost",
    "Mortality cause",
    "Feed item",
    "Feed quantity",
    "Sick birds",
    "Sick notes",
    "Eggs sold",
    "Chicks sold",
    "Sale amount (EUR)",
    "Sale amount (Ar)",
    "Weather",
    "Notes",
    "Recorded by",
  ];

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
