import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, LinkButton, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { computeFinancialReport } from "@/lib/reports";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const { year: yearParam, month: monthParam } = await searchParams;
  const now = new Date();
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam, 10) : undefined;

  const start = month !== undefined ? new Date(year, month, 1) : new Date(year, 0, 1);
  const end = month !== undefined ? new Date(year, month + 1, 1) : new Date(year + 1, 0, 1);

  const report = await computeFinancialReport(start, end);

  const periodLabel = month !== undefined ? `${MONTH_NAMES[month]} ${year}` : `Year ${year}`;
  const pdfHref = month !== undefined ? `/api/reports/pdf?year=${year}&month=${month}` : `/api/reports/pdf?year=${year}`;

  return (
    <div>
      <PageHeader
        title="Reports"
        description={`Income statement for ${periodLabel}.`}
        action={<LinkButton href={pdfHref} variant="secondary">Download PDF</LinkButton>}
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">View:</span>
          <a
            href={`/reports?year=${year}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${month === undefined ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}
          >
            Full year
          </a>
          {MONTH_NAMES.map((name, i) => (
            <a
              key={name}
              href={`/reports?year=${year}&month=${i}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${month === i ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}
            >
              {name.slice(0, 3)}
            </a>
          ))}
          <span className="mx-2 text-zinc-300 dark:text-zinc-700">|</span>
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
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total revenue</p>
          <p className="text-xl font-semibold text-emerald-600">{formatMoney(report.totalIncome)}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total costs</p>
          <p className="text-xl font-semibold text-red-600">{formatMoney(report.totalExpense)}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Net result</p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatMoney(report.net)}{" "}
            <span className="text-sm font-normal text-zinc-400">({report.marginPct.toFixed(1)}% margin)</span>
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Revenue</h2>
        {report.incomeByCategory.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No income recorded for this period.</p>
        ) : (
          <Table>
            <THead>
              <Th>Category</Th>
              <Th>Amount</Th>
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
        <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Costs</h2>
        {report.expenseByCategory.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No expenses recorded for this period.</p>
        ) : (
          <Table>
            <THead>
              <Th>Category</Th>
              <Th>Amount</Th>
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
