import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Button,
  Card,
  LinkButton,
  PageHeader,
  Table,
  TBody,
  Td,
  Th,
  THead,
} from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
import { updateInvoiceStatusAction } from "../actions";
import type { InvoiceStatus } from "@prisma/client";

const STATUS_TONE = {
  DRAFT: "zinc",
  SENT: "blue",
  PAID: "green",
  OVERDUE: "amber",
  CANCELLED: "red",
} as const;

const ALL_STATUSES: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: true, createdBy: true },
  });
  if (!invoice) notFound();

  return (
    <div>
      <PageHeader
        title={invoice.invoiceNumber}
        description={`${invoice.customer.name} · ${t.invoices.issueDate.toLowerCase()} ${formatDate(invoice.issueDate)}`}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/invoices/${invoice.id}/edit`} variant="secondary">{t.invoices.edit}</LinkButton>
            <LinkButton href={`/api/invoices/${invoice.id}/pdf`} variant="secondary">{t.invoices.downloadPdf}</LinkButton>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone={STATUS_TONE[invoice.status]}>{t.invoiceStatus[invoice.status]}</Badge>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.filter((s) => s !== invoice.status).map((status) => (
            <form key={status} action={updateInvoiceStatusAction.bind(null, invoice.id, status)}>
              <Button type="submit" variant="secondary">
                {t.invoices.markAs} {t.invoiceStatus[status].toLowerCase()}
              </Button>
            </form>
          ))}
        </div>
      </div>

      <Card className="mb-6">
        <Table>
          <THead>
            <Th>{t.invoices.form.product}</Th>
            <Th>{t.invoices.form.description}</Th>
            <Th>{t.invoices.qty}</Th>
            <Th>{t.invoices.form.unitPrice}</Th>
            <Th>{t.common.total}</Th>
          </THead>
          <TBody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <Td>{t.productType[item.productType]}</Td>
                <Td>{item.description}</Td>
                <Td>{item.quantity}</Td>
                <Td>{formatMoney(item.unitPrice)}</Td>
                <Td>{formatMoney(item.total)}</Td>
              </tr>
            ))}
          </TBody>
        </Table>

        <div className="ml-auto mt-4 max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">{t.invoices.form.subtotal}</span>
            <span>{formatMoney(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{t.invoices.form.tax}</span>
            <span>{formatMoney(invoice.tax)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-stone-900 dark:text-stone-50">
            <span>{t.invoices.form.total}</span>
            <span>{formatMoney(invoice.total)}</span>
          </div>
        </div>
      </Card>

      {invoice.notes && (
        <Card>
          <p className="text-sm text-stone-600 dark:text-stone-300">{invoice.notes}</p>
        </Card>
      )}
    </div>
  );
}
