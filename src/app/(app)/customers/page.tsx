import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { CreateCustomerForm } from "./create-customer-form";

export default async function CustomersPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { invoices: true } } },
  });

  return (
    <div>
      <PageHeader title={t.customers.title} description={t.customers.description} />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {t.customers.addCustomer}
        </h2>
        <CreateCustomerForm />
      </Card>

      {customers.length === 0 ? (
        <EmptyState>{t.customers.emptyState}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.customers.name}</Th>
            <Th>{t.customers.phone}</Th>
            <Th>{t.customers.email}</Th>
            <Th>{t.customers.address}</Th>
            <Th>{t.customers.invoices}</Th>
          </THead>
          <TBody>
            {customers.map((c) => (
              <tr key={c.id}>
                <Td className="font-medium text-stone-900 dark:text-stone-100">
                  <Link href={`/customers/${c.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    {c.name}
                  </Link>
                </Td>
                <Td>{c.phone ?? t.common.none}</Td>
                <Td>{c.email ?? t.common.none}</Td>
                <Td>{c.address ?? t.common.none}</Td>
                <Td>{c._count.invoices}</Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
