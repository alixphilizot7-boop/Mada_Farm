import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, LinkButton, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { computeFinancialReport } from "@/lib/reports";
import { getDictionary } from "@/lib/i18n/locale";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();
  const r = t.reports;
  const MONTH_NAMES = r.months;

  const { year: yearParam, month: monthParam } = await searchParams;
  const now = new Date();
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam, 10) : undefined;

  const start = month !== undefined ? new Date(year, month, 1) : new Date(year, 0, 1);
  const end = month !== undefined ? new Date(year, month + 1, 1) : new Date(year + 1, 0, 1);

  const report = await computeFinancialReport(start, end);

  const periodLabel = month !== undefined ? `${MONTH_NAMES[month]} ${year}` : `${year}`;
  const pdfHref = month !== undefined ? `/api/reports/pdf?year=${year}&month=${month}` : `/api/reports/pdf?year=${year}`;

  return (
    <div>
      <PageHeader
        title={r.title}
        description={`${r.incomeStatementFor} ${periodLabel}.`}
        action={<LinkButton href={pdfHref} variant="secondary">{r.downloadPdf}</LinkButton>}
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-stone-500 dark:text-stone-400">{r.view}</span>
          <a
            href={`/reports?year=${year}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${month === undefined ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"}`}
          >
            {r.fullYear}
          </a>
          {MONTH_NAMES.map((name, i) => (
            <a
              key={name}
              href={`/reports?year=${year}&month=${i}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${month === i ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"}`}
            >
              {name.slice(0, 3)}
            </a>
          ))}
          <span className="mx-2 text-stone-300 dark:text-stone-700">|</span>
          <a href={`/reports?year=${year - 1}${month !== undefined ? `&month=${month}` : ""}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
            ← {year - 1}
          </a>
          <a href={`/reports?year=${year + 1}${month !== undefined ? `&month=${month}` : ""}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
            {year + 1} →
          </a>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{r.totalRevenue}</p>
          <p className="text-xl font-semibold text-emerald-600">{formatMoney(report.totalIncome)}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{r.totalCosts}</p>
          <p className="text-xl font-semibold text-red-600">{formatMoney(report.totalExpense)}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{r.netResult}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {formatMoney(report.net)}{" "}
            <span className="text-sm font-normal text-stone-400">({report.marginPct.toFixed(1)}% {r.margin})</span>
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">{r.revenue}</h2>
        {report.incomeByCategory.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">{r.noIncome}</p>
        ) : (
          <Table>
            <THead>
              <Th>{r.category}</Th>
              <Th>{r.amount}</Th>
            </THead>
            <TBody>
              {report.incomeByCategory.map((l) => (
                <tr key={l.category}>
                  <Td>{l.category}</Td>
                  <Td>{formatMoney(l.amount)}</Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">{r.costs}</h2>
        {report.expenseByCategory.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">{r.noExpenses}</p>
        ) : (
          <Table>
            <THead>
              <Th>{r.category}</Th>
              <Th>{r.amount}</Th>
            </THead>
            <TBody>
              {report.expenseByCategory.map((l) => (
                <tr key={l.category}>
                  <Td>{l.category}</Td>
                  <Td>{formatMoney(l.amount)}</Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
