import { Bird, Egg, HeartCrack, PackageSearch, Wallet, Receipt } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, LinkButton, PageHeader, StatCard } from "@/components/ui";
import { formatMoney, formatDate } from "@/lib/format";
import { EggTrendChart } from "@/components/charts/egg-trend-chart";
import { CashFlowChart } from "@/components/charts/cash-flow-chart";
import { ChickProductionChart } from "@/components/charts/chick-production-chart";
import { computeVaccinationAlerts } from "@/lib/vaccination-schedule";
import { getDictionary } from "@/lib/i18n/locale";

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default async function DashboardPage() {
  const session = await auth();
  const { locale, t } = await getDictionary();
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const isAdmin = session?.user.role === "ADMIN";
  const now = new Date();

  const eggRangeStart = startOfDay(now);
  eggRangeStart.setDate(eggRangeStart.getDate() - 13);

  const cashRangeStart = startOfDay(now);
  cashRangeStart.setDate(cashRangeStart.getDate() - 7 * 8);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = startOfDay(now);

  const chickRangeStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [flocks, eggLogs, chickHatches, items, mortalityAgg, todayMortalityAgg, vaccinationHistory, cashTxns, incomeAgg, expenseAgg, outstandingAgg] =
    await Promise.all([
      prisma.flock.findMany({ where: { status: "ACTIVE" } }),
      prisma.eggLog.findMany({ where: { date: { gte: eggRangeStart } } }),
      prisma.chickHatch.findMany({ where: { date: { gte: chickRangeStart } } }),
      prisma.inventoryItem.findMany(),
      prisma.mortalityLog.aggregate({ _sum: { quantity: true }, where: { date: { gte: monthStart } } }),
      prisma.mortalityLog.aggregate({ _sum: { quantity: true }, where: { date: { gte: todayStart } } }),
      prisma.healthRecord.findMany({
        where: { vaccinationType: { not: null } },
        select: { flockId: true, vaccinationType: true, date: true },
      }),
      isAdmin ? prisma.cashTransaction.findMany({ where: { date: { gte: cashRangeStart } } }) : Promise.resolve([]),
      isAdmin
        ? prisma.cashTransaction.aggregate({ _sum: { amount: true }, where: { type: "INCOME" } })
        : Promise.resolve({ _sum: { amount: 0 } }),
      isAdmin
        ? prisma.cashTransaction.aggregate({ _sum: { amount: true }, where: { type: "EXPENSE" } })
        : Promise.resolve({ _sum: { amount: 0 } }),
      isAdmin
        ? prisma.invoice.aggregate({ _sum: { total: true }, where: { status: { in: ["SENT", "OVERDUE"] } } })
        : Promise.resolve({ _sum: { total: 0 } }),
    ]);

  const totalBirds = flocks.reduce((s, f) => s + f.currentCount, 0);
  const lowStockItems = items.filter((i) => i.currentStock <= i.reorderLevel);
  const vaccinationAlerts = computeVaccinationAlerts(flocks, vaccinationHistory, now);

  const eggDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(eggRangeStart);
    d.setDate(d.getDate() + i);
    return { date: d, eggs: 0 };
  });
  for (const log of eggLogs) {
    const idx = Math.floor((startOfDay(log.date).getTime() - eggRangeStart.getTime()) / 86400000);
    if (idx >= 0 && idx < 14) eggDays[idx].eggs += log.wholeCount;
  }
  const eggChartData = eggDays.map((d) => ({
    label: d.date.toLocaleDateString(dateLocale, { month: "short", day: "numeric" }),
    eggs: d.eggs,
  }));
  const eggsToday = eggDays[13].eggs;
  const eggsThisWeek = eggDays.slice(7).reduce((s, d) => s + d.eggs, 0);

  const chickMonths = Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date(chickRangeStart.getFullYear(), chickRangeStart.getMonth() + i, 1);
    return { monthDate, chicks: 0 };
  });
  for (const hatch of chickHatches) {
    const idx =
      (hatch.date.getFullYear() - chickRangeStart.getFullYear()) * 12 +
      (hatch.date.getMonth() - chickRangeStart.getMonth());
    if (idx >= 0 && idx < 6) chickMonths[idx].chicks += hatch.chicksHatched;
  }
  const chickChartData = chickMonths.map((m) => ({
    label: m.monthDate.toLocaleDateString(dateLocale, { month: "short", year: "2-digit" }),
    chicks: m.chicks,
  }));

  const cashWeeks = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(cashRangeStart);
    weekStart.setDate(weekStart.getDate() + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return { weekStart, weekEnd, income: 0, expense: 0 };
  });
  for (const t of cashTxns) {
    const idx = cashWeeks.findIndex((w) => t.date >= w.weekStart && t.date < w.weekEnd);
    if (idx >= 0) {
      if (t.type === "INCOME") cashWeeks[idx].income += t.amount;
      else cashWeeks[idx].expense += t.amount;
    }
  }
  const cashChartData = cashWeeks.map((w) => ({
    label: w.weekStart.toLocaleDateString(dateLocale, { month: "short", day: "numeric" }),
    income: w.income,
    expense: w.expense,
  }));

  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpense = expenseAgg._sum.amount ?? 0;
  const outstanding = outstandingAgg._sum.total ?? 0;
  const mortalityThisMonth = mortalityAgg._sum.quantity ?? 0;
  const mortalityToday = todayMortalityAgg._sum.quantity ?? 0;

  return (
    <div>
      <PageHeader
        title={`${t.dashboard.welcome}, ${session?.user?.name ?? ""}`}
        description={t.dashboard.subtitle}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Bird}
          label={t.dashboard.activeFlocks}
          value={
            <>
              {flocks.length} <span className="text-sm font-normal text-stone-400">· {totalBirds} {t.dashboard.birds}</span>
            </>
          }
        />
        <StatCard
          icon={Egg}
          tone="amber"
          label={t.dashboard.eggsTodayWeek}
          value={
            <>
              {eggsToday} <span className="text-sm font-normal text-stone-400">/ {eggsThisWeek}</span>
            </>
          }
        />
        <StatCard icon={HeartCrack} tone="red" label={t.dashboard.lostThisMonth} value={mortalityThisMonth} />
        <StatCard
          icon={PackageSearch}
          tone={lowStockItems.length > 0 ? "amber" : "stone"}
          label={t.dashboard.lowStockItems}
          value={lowStockItems.length}
          hint={
            lowStockItems.length > 0 && (
              <p className="mt-1 truncate text-xs text-amber-600 dark:text-amber-400">
                {lowStockItems.map((i) => i.name).join(", ")}
              </p>
            )
          }
        />
      </div>

      {mortalityToday > 3 && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
            {t.dashboard.highMortalityAlert} — {mortalityToday} {t.dashboard.highMortalityHint}
          </p>
        </Card>
      )}

      {vaccinationAlerts.length > 0 && (
        <Card className="mb-6 border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-300">
            {t.dashboard.vaccinationDue}
          </p>
          <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-300">
            {vaccinationAlerts.slice(0, 8).map((a, i) => (
              <li key={i}>
                <span className="font-medium">{a.flockName}</span> — {a.rule.name}{" "}
                {a.overdue ? (
                  <span className="font-semibold">{t.dashboard.overdueSince} {formatDate(a.dueDate)}</span>
                ) : (
                  <span>{t.dashboard.due} {formatDate(a.dueDate)}</span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {isAdmin && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Wallet} tone="emerald" label={t.dashboard.netCashBalance} value={formatMoney(totalIncome - totalExpense)} />
          <StatCard icon={Receipt} tone="blue" label={t.dashboard.outstandingInvoices} value={formatMoney(outstanding)} />
          <Card className="flex flex-col justify-center gap-2">
            <LinkButton href="/invoices/new">{t.dashboard.newInvoice}</LinkButton>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">
            {t.dashboard.eggProduction14}
          </h2>
          <EggTrendChart data={eggChartData} />
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">
            {t.dashboard.chickProduction6}
          </h2>
          <ChickProductionChart data={chickChartData} />
        </Card>

        {isAdmin ? (
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">
              {t.dashboard.cashFlow8}
            </h2>
            <CashFlowChart data={cashChartData} />
          </Card>
        ) : (
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">{t.dashboard.flocksTitle}</h2>
            <div className="flex flex-wrap gap-2">
              {flocks.map((f) => (
                <Badge key={f.id} tone="green">
                  {f.name} · {f.currentCount}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
