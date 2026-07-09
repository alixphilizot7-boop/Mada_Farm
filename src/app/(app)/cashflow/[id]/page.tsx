import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { EditTransactionForm } from "./edit-transaction-form";

export default async function EditCashTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const txn = await prisma.cashTransaction.findUnique({
    where: { id },
    include: {
      invoice: true,
      purchase: { include: { item: true } },
      healthRecord: { include: { flock: true } },
      capexItem: true,
    },
  });
  if (!txn) notFound();

  const source = txn.invoice
    ? { label: `Invoice ${txn.invoice.invoiceNumber}`, href: `/invoices/${txn.invoice.id}` }
    : txn.purchase
      ? { label: `Purchase of ${txn.purchase.item.name}`, href: `/inventory/purchases/${txn.purchase.id}` }
      : txn.healthRecord
        ? { label: `Health record for flock "${txn.healthRecord.flock.name}"`, href: `/health/${txn.healthRecord.id}` }
        : txn.capexItem
          ? { label: `Construction/equipment item "${txn.capexItem.name}"`, href: `/capex/${txn.capexItem.id}` }
          : null;

  return (
    <div>
      <PageHeader title="Edit Cash Flow Entry" />
      <Card>
        {source ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            This entry was auto-generated from{" "}
            <Link href={source.href} className="text-emerald-700 hover:underline dark:text-emerald-400">
              {source.label}
            </Link>
            . Edit it there instead — it will keep this entry in sync.
          </p>
        ) : (
          <EditTransactionForm txn={txn} />
        )}
      </Card>
    </div>
  );
}
