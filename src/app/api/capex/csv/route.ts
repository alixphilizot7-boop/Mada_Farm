import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError } from "@/lib/require-user";
import { getFarmSettings } from "@/lib/farm-settings";
import { getDictionary } from "@/lib/i18n/locale";

function csvCell(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) return new Response("Unauthorized", { status: 403 });
    throw error;
  }

  const [items, settings, { t }] = await Promise.all([
    prisma.capexItem.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    getFarmSettings(),
    getDictionary(),
  ]);
  const mgaPerEur = settings.mgaPerEur;

  const header = t.capex.csvHeaders;

  const rows = items.map((item) => [
    item.category,
    item.name,
    item.plannedQuantity ?? "",
    item.plannedUnitCost ?? "",
    item.plannedTotal ?? "",
    item.plannedTotal != null ? Math.round(item.plannedTotal * mgaPerEur) : "",
    t.capexStatus[item.status],
    item.status === "PURCHASED" ? item.actualTotal ?? "" : "",
    item.supplier ?? "",
    item.notes ?? "",
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mada-farm-capex.csv"`,
    },
  });
}
