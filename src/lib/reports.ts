import { prisma } from "@/lib/prisma";

export type ReportLine = { category: string; amount: number };

export type FinancialReport = {
  start: Date;
  end: Date;
  incomeByCategory: ReportLine[];
  expenseByCategory: ReportLine[];
  totalIncome: number;
  totalExpense: number;
  net: number;
  marginPct: number;
};

export async function computeFinancialReport(start: Date, end: Date): Promise<FinancialReport> {
  const transactions = await prisma.cashTransaction.findMany({
    where: { date: { gte: start, lt: end } },
  });

  function byCategory(type: "INCOME" | "EXPENSE"): ReportLine[] {
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== type) continue;
      totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
    }
    return [...totals.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  const incomeByCategory = byCategory("INCOME");
  const expenseByCategory = byCategory("EXPENSE");
  const totalIncome = incomeByCategory.reduce((s, l) => s + l.amount, 0);
  const totalExpense = expenseByCategory.reduce((s, l) => s + l.amount, 0);
  const net = totalIncome - totalExpense;
  const marginPct = totalIncome > 0 ? (net / totalIncome) * 100 : 0;

  return { start, end, incomeByCategory, expenseByCategory, totalIncome, totalExpense, net, marginPct };
}
