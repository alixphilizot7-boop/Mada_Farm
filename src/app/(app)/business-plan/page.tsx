import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { getFarmSettings, planYearForDate } from "@/lib/farm-settings";

function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const tone = pct >= 100 ? "bg-emerald-600" : pct >= 60 ? "bg-blue-500" : "bg-amber-500";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default async function BusinessPlanPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const settings = await getFarmSettings();
  const now = new Date();
  const { year, yearStart, yearEnd } = planYearForDate(settings.farmStartDate, now);

  if (year < 1) {
    const daysUntilStart = Math.ceil((settings.farmStartDate.getTime() - now.getTime()) / 86400000);
    return (
      <div>
        <PageHeader title="Business Plan" description="Actual performance vs. your 5-year plan targets." />
        <Card>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Farm operations are set to start on {formatDate(settings.farmStartDate)} — {daysUntilStart} day(s) from
            now. Tracking against Year 1 targets will begin then.
          </p>
        </Card>
      </div>
    );
  }

  const planYear = year <= 5 ? await prisma.planYear.findUnique({ where: { year } }) : null;

  const [eggAgg, chickItems, incomeAgg, expenseAgg] = await Promise.all([
    prisma.eggLog.aggregate({ _sum: { wholeCount: true }, where: { date: { gte: yearStart, lt: yearEnd } } }),
    prisma.invoiceItem.findMany({
      where: {
        productType: "CHICKS",
        invoice: { issueDate: { gte: yearStart, lt: yearEnd }, status: { in: ["SENT", "PAID", "OVERDUE"] } },
      },
    }),
    prisma.cashTransaction.aggregate({ _sum: { amount: true }, where: { type: "INCOME", date: { gte: yearStart, lt: yearEnd } } }),
    prisma.cashTransaction.aggregate({ _sum: { amount: true }, where: { type: "EXPENSE", date: { gte: yearStart, lt: yearEnd } } }),
  ]);

  const actualEggs = eggAgg._sum.wholeCount ?? 0;
  const actualChicksSold = chickItems.reduce((s, i) => s + i.quantity, 0);
  const actualRevenue = incomeAgg._sum.amount ?? 0;
  const actualCosts = expenseAgg._sum.amount ?? 0;
  const actualNet = actualRevenue - actualCosts;

  const rows = planYear
    ? [
        { label: "Eggs produced", target: planYear.targetEggs, actual: actualEggs, isMoney: false },
        { label: "Chicks sold", target: planYear.targetChicksSold, actual: actualChicksSold, isMoney: false },
        { label: "Revenue", target: planYear.targetRevenue, actual: actualRevenue, isMoney: true },
        { label: "Costs", target: planYear.targetCosts, actual: actualCosts, isMoney: true },
        { label: "Net result", target: planYear.targetNetResult, actual: actualNet, isMoney: true },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Business Plan"
        description={
          year > 5
            ? "Beyond your original 5-year plan — nothing further to compare against."
            : `Year ${year} of 5 · ${formatDate(yearStart)} – ${formatDate(yearEnd)}`
        }
      />

      {planYear && (
        <Table>
          <THead>
            <Th>Metric</Th>
            <Th>Target (Year {year})</Th>
            <Th>Actual so far</Th>
            <Th>Progress</Th>
          </THead>
          <TBody>
            {rows.map((r) => {
              const pct = r.target !== 0 ? (r.actual / r.target) * 100 : r.actual >= 0 ? 100 : 0;
              return (
                <tr key={r.label}>
                  <Td className="font-medium text-zinc-900 dark:text-zinc-100">{r.label}</Td>
                  <Td>{r.isMoney ? formatMoney(r.target) : r.target}</Td>
                  <Td>{r.isMoney ? formatMoney(r.actual) : r.actual}</Td>
                  <Td className="min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <ProgressBar pct={pct} />
                      <span className="whitespace-nowrap text-xs text-zinc-500">{pct.toFixed(0)}%</span>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
