import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
import { CreateTransactionForm } from "./create-transaction-form";
import { CashFlowTable, type CashFlowRow } from "./cashflow-table";

export default async function CashFlowPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();
  const c = t.cashflow;

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

  const withBalance = transactions.reduce<CashFlowRow[]>((acc, tx) => {
    const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    const balance = prevBalance + (tx.type === "INCOME" ? tx.amount : -tx.amount);
    const details =
      tx.description ??
      (tx.invoice && `${c.invoiceLabel} ${tx.invoice.invoiceNumber} — ${tx.invoice.customer.name}`) ??
      (tx.purchase && `${tx.purchase.quantity} ${tx.purchase.item.unit} ${c.purchaseOf.toLowerCase()} ${tx.purchase.item.name}`) ??
      (tx.healthRecord && `${c.healthRecordFor} "${tx.healthRecord.flock.name}"`) ??
      t.common.none;
    acc.push({ id: tx.id, date: tx.date, type: tx.type, category: tx.category, details, amount: tx.amount, balance });
    return acc;
  }, []);

  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const display = [...withBalance].reverse();

  return (
    <div>
      <PageHeader title={c.title} description={c.description} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{c.totalIncome}</p>
          <p className="text-xl font-semibold text-emerald-600">{formatMoney(totalIncome)}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{c.totalExpenses}</p>
          <p className="text-xl font-semibold text-red-600">{formatMoney(totalExpense)}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{c.netBalance}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {formatMoney(totalIncome - totalExpense)}
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {c.addManualEntry}
        </h2>
        <p className="mb-4 text-xs text-stone-500 dark:text-stone-400">{c.manualEntryHint}</p>
        <CreateTransactionForm />
      </Card>

      <CashFlowTable rows={display} />
    </div>
  );
}
