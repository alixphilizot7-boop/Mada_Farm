import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { CreateTransactionForm } from "./create-transaction-form";

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

  const withBalance = transactions.reduce<(typeof transactions[number] & { balance: number })[]>(
    (acc, t) => {
      const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      const balance = prevBalance + (t.type === "INCOME" ? t.amount : -t.amount);
      acc.push({ ...t, balance });
      return acc;
    },
    []
  );

  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const display = [...withBalance].reverse();

  return (
    <div>
      <PageHeader title="Cash Flow" description="Every income and expense, tied back to its operation." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total income</p>
          <p className="text-xl font-semibold text-emerald-600">{formatMoney(totalIncome)}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total expenses</p>
          <p className="text-xl font-semibold text-red-600">{formatMoney(totalExpense)}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Net balance</p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatMoney(totalIncome - totalExpense)}
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Add a manual entry
        </h2>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          Purchases, health costs and paid invoices are logged here automatically. Use this for
          anything else (transport, equipment, other income, etc).
        </p>
        <CreateTransactionForm />
      </Card>

      {display.length === 0 ? (
        <EmptyState>No cash flow activity yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Category</Th>
            <Th>Details</Th>
            <Th>Amount</Th>
            <Th>Balance</Th>
            <Th></Th>
          </THead>
          <TBody>
            {display.map((t) => (
              <tr key={t.id}>
                <Td className="whitespace-nowrap">{formatDate(t.date)}</Td>
                <Td>
                  <Badge tone={t.type === "INCOME" ? "green" : "red"}>{t.type}</Badge>
                </Td>
                <Td>{t.category}</Td>
                <Td>
                  {t.description ??
                    (t.invoice && `Invoice ${t.invoice.invoiceNumber} — ${t.invoice.customer.name}`) ??
                    (t.purchase && `${t.purchase.quantity} ${t.purchase.item.unit} of ${t.purchase.item.name}`) ??
                    (t.healthRecord && `Health record for flock "${t.healthRecord.flock.name}"`) ??
                    "—"}
                </Td>
                <Td className={t.type === "INCOME" ? "text-emerald-600" : "text-red-600"}>
                  {t.type === "INCOME" ? "+" : "-"}
                  {formatMoney(t.amount)}
                </Td>
                <Td className="font-medium">{formatMoney(t.balance)}</Td>
                <Td>
                  <Link href={`/cashflow/${t.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    Edit
                  </Link>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
