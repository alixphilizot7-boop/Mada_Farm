import { renderToBuffer } from "@react-pdf/renderer";
import { formatMoney } from "@/lib/format";
import { computeFinancialReport } from "@/lib/reports";
import { ReportPdf } from "@/components/report-pdf";
import { requireAdmin, AuthError } from "@/lib/require-user";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) return new Response("Unauthorized", { status: 403 });
    throw error;
  }

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()), 10);
  const monthParam = searchParams.get("month");
  const month = monthParam !== null ? parseInt(monthParam, 10) : undefined;

  const start = month !== undefined ? new Date(year, month, 1) : new Date(year, 0, 1);
  const end = month !== undefined ? new Date(year, month + 1, 1) : new Date(year + 1, 0, 1);
  const periodLabel = month !== undefined ? `${MONTH_NAMES[month]} ${year}` : `Year ${year}`;

  const report = await computeFinancialReport(start, end);

  const buffer = await renderToBuffer(
    <ReportPdf
      periodLabel={periodLabel}
      incomeByCategory={report.incomeByCategory}
      expenseByCategory={report.expenseByCategory}
      totalIncome={report.totalIncome}
      totalExpense={report.totalExpense}
      net={report.net}
      marginPct={report.marginPct}
      formatMoney={formatMoney}
    />
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="mada-farm-report-${periodLabel.replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
