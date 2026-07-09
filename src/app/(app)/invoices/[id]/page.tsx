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
        description={`${invoice.customer.name} · issued ${formatDate(invoice.issueDate)}`}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/invoices/${invoice.id}/edit`} variant="secondary">Edit</LinkButton>
            <LinkButton href={`/api/invoices/${invoice.id}/pdf`} variant="secondary">Download PDF</LinkButton>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone={STATUS_TONE[invoice.status]}>{invoice.status}</Badge>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.filter((s) => s !== invoice.status).map((status) => (
            <form key={status} action={updateInvoiceStatusAction.bind(null, invoice.id, status)}>
              <Button type="submit" variant="secondary">
                Mark {status.toLowerCase()}
              </Button>
            </form>
          ))}
        </div>
      </div>

      <Card className="mb-6">
        <Table>
          <THead>
            <Th>Product</Th>
            <Th>Description</Th>
            <Th>Qty</Th>
            <Th>Unit price</Th>
            <Th>Total</Th>
          </THead>
          <TBody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <Td>{item.productType}</Td>
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
            <span className="text-zinc-500">Subtotal</span>
            <span>{formatMoney(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Tax</span>
            <span>{formatMoney(invoice.tax)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-zinc-900 dark:text-zinc-50">
            <span>Total</span>
            <span>{formatMoney(invoice.total)}</span>
          </div>
        </div>
      </Card>

      {invoice.notes && (
        <Card>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{invoice.notes}</p>
        </Card>
      )}
    </div>
  );
}
