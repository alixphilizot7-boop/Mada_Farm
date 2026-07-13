import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, LinkButton, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
import { EditCustomerForm } from "./edit-customer-form";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();

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
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">{t.customers.editCustomer}</h2>
        <EditCustomerForm customer={customer} />
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-200">{t.customers.invoices}</h2>
      {customer.invoices.length === 0 ? (
        <EmptyState>{t.customers.noInvoices}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.customers.invoiceNumber}</Th>
            <Th>{t.customers.issueDate}</Th>
            <Th>{t.common.total}</Th>
            <Th>{t.common.status}</Th>
            <Th></Th>
          </THead>
          <TBody>
            {customer.invoices.map((inv) => (
              <tr key={inv.id}>
                <Td>{inv.invoiceNumber}</Td>
                <Td className="whitespace-nowrap">{formatDate(inv.issueDate)}</Td>
                <Td>{formatMoney(inv.total)}</Td>
                <Td>{t.invoiceStatus[inv.status]}</Td>
                <Td>
                  <LinkButton href={`/invoices/${inv.id}`} variant="ghost">
                    {t.customers.view}
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
