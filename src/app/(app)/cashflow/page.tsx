import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { CreateTransactionForm } from "./create-transaction-form";
import { CashFlowTable, type CashFlowRow } from "./cashflow-table";

export default async function CashFlowPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const transactions = await prisma.cashTransaction.findMany({
    orderBy: { date: "asc" },
    take: 500,
    include: {
      invoice: { include: { customer: true } },
      purchase: { include: { item: true } },
      healthRecord: { include: { flock: true } },
      recordedBy: true,
    },
  });

  const withBalance = transactions.reduce<CashFlowRow[]>((acc, t) => {
    const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    const balance = prevBalance + (t.type === "INCOME" ? t.amount : -t.amount);
    const details =
      t.description ??
      (t.invoice && `Invoice ${t.invoice.invoiceNumber} — ${t.invoice.customer.name}`) ??
      (t.purchase && `${t.purchase.quantity} ${t.purchase.item.unit} of ${t.purchase.item.name}`) ??
      (t.healthRecord && `Health record for flock "${t.healthRecord.flock.name}"`) ??
      "—";
    acc.push({ id: t.id, date: t.date, type: t.type, category: t.category, details, amount: t.amount, balance });
    return acc;
  }, []);

  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const display = [...withBalance].reverse();

  return (
    <div>
      <PageHeader title="Cash Flow" description="Every income and expense, tied back to its operation." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Total income</p>
          <p className="text-xl font-semibold text-emerald-600">{formatMoney(totalIncome)}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Total expenses</p>
          <p className="text-xl font-semibold text-red-600">{formatMoney(totalExpense)}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Net balance</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {formatMoney(totalIncome - totalExpense)}
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          Add a manual entry
        </h2>
        <p className="mb-4 text-xs text-stone-500 dark:text-stone-400">
          Purchases, health costs and paid invoices are logged here automatically. Use this for
          anything else (transport, equipment, other income, etc).
        </p>
        <CreateTransactionForm />
      </Card>

      <CashFlowTable rows={display} />
    </div>
  );
}
