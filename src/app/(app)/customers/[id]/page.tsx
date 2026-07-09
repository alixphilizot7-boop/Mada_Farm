import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, LinkButton, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { EditCustomerForm } from "./edit-customer-form";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { invoices: { orderBy: { issueDate: "desc" } } },
  });
  if (!customer) notFound();

  return (
    <div>
      <PageHeader title={customer.name} />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">Edit customer</h2>
        <EditCustomerForm customer={customer} />
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">Invoices</h2>
      {customer.invoices.length === 0 ? (
        <EmptyState>No invoices for this customer yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Invoice #</Th>
            <Th>Issue date</Th>
            <Th>Total</Th>
            <Th>Status</Th>
            <Th></Th>
          </THead>
          <TBody>
            {customer.invoices.map((inv) => (
              <tr key={inv.id}>
                <Td>{inv.invoiceNumber}</Td>
                <Td className="whitespace-nowrap">{formatDate(inv.issueDate)}</Td>
                <Td>{formatMoney(inv.total)}</Td>
                <Td>{inv.status}</Td>
                <Td>
                  <LinkButton href={`/invoices/${inv.id}`} variant="ghost">
                    View
                  </LinkButton>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
