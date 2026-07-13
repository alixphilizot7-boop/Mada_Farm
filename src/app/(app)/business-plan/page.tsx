import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { getFarmSettings, planYearForDate } from "@/lib/farm-settings";
import { getDictionary } from "@/lib/i18n/locale";

function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const tone = pct >= 100 ? "bg-emerald-600" : pct >= 60 ? "bg-blue-500" : "bg-amber-500";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default async function BusinessPlanPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();
  const bp = t.businessPlan;

  const settings = await getFarmSettings();
  const now = new Date();
  const { year, yearStart, yearEnd } = planYearForDate(settings.farmStartDate, now);

  if (year < 1) {
    const daysUntilStart = Math.ceil((settings.farmStartDate.getTime() - now.getTime()) / 86400000);
    return (
      <div>
        <PageHeader title={bp.title} description={bp.description} />
        <Card>
          <p className="text-sm text-stone-600 dark:text-stone-300">
            {bp.startsOn} {formatDate(settings.farmStartDate)} — {daysUntilStart} {bp.daysFromNow}
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
        { label: bp.eggsProduced, target: planYear.targetEggs, actual: actualEggs, isMoney: false },
        { label: bp.chicksSold, target: planYear.targetChicksSold, actual: actualChicksSold, isMoney: false },
        { label: bp.revenue, target: planYear.targetRevenue, actual: actualRevenue, isMoney: true },
        { label: bp.costs, target: planYear.targetCosts, actual: actualCosts, isMoney: true },
        { label: bp.netResult, target: planYear.targetNetResult, actual: actualNet, isMoney: true },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title={bp.title}
        description={
          year > 5
            ? bp.beyondPlan
            : `${bp.yearOf5} ${year} ${bp.of5} · ${formatDate(yearStart)} – ${formatDate(yearEnd)}`
        }
      />

      {planYear && (
        <Table>
          <THead>
            <Th>{bp.metric}</Th>
            <Th>{bp.target} {year})</Th>
            <Th>{bp.actualSoFar}</Th>
            <Th>{bp.progress}</Th>
          </THead>
          <TBody>
            {rows.map((r) => {
              const pct = r.target !== 0 ? (r.actual / r.target) * 100 : r.actual >= 0 ? 100 : 0;
              return (
                <tr key={r.label}>
                  <Td className="font-medium text-stone-900 dark:text-stone-100">{r.label}</Td>
                  <Td>{r.isMoney ? formatMoney(r.target) : r.target}</Td>
                  <Td>{r.isMoney ? formatMoney(r.actual) : r.actual}</Td>
                  <Td className="min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <ProgressBar pct={pct} />
                      <span className="whitespace-nowrap text-xs text-stone-500">{pct.toFixed(0)}%</span>
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
