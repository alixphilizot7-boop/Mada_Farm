import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, EmptyState, LinkButton, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";

const STATUS_TONE = {
  DRAFT: "zinc",
  SENT: "blue",
  PAID: "green",
  OVERDUE: "amber",
  CANCELLED: "red",
} as const;

export default async function InvoicesPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const invoices = await prisma.invoice.findMany({
    orderBy: { issueDate: "desc" },
    include: { customer: true },
    take: 200,
  });

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Bills issued for eggs, chicks and chicken sold."
        action={<LinkButton href="/invoices/new">New invoice</LinkButton>}
      />

      {invoices.length === 0 ? (
        <EmptyState>No invoices yet. Create your first one.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Invoice #</Th>
            <Th>Customer</Th>
            <Th>Issue date</Th>
            <Th>Total</Th>
            <Th>Status</Th>
          </THead>
          <TBody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <Td>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    {inv.invoiceNumber}
                  </Link>
                </Td>
                <Td>{inv.customer.name}</Td>
                <Td className="whitespace-nowrap">{formatDate(inv.issueDate)}</Td>
                <Td>{formatMoney(inv.total)}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[inv.status]}>{inv.status}</Badge>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
