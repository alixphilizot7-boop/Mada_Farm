import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { CreateCustomerForm } from "./create-customer-form";

export default async function CustomersPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { invoices: true } } },
  });

  return (
    <div>
      <PageHeader title="Customers" description="People and businesses you sell eggs, chicks or chicken to." />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          Add a customer
        </h2>
        <CreateCustomerForm />
      </Card>

      {customers.length === 0 ? (
        <EmptyState>No customers yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
            <Th>Address</Th>
            <Th>Invoices</Th>
          </THead>
          <TBody>
            {customers.map((c) => (
              <tr key={c.id}>
                <Td className="font-medium text-stone-900 dark:text-stone-100">
                  <Link href={`/customers/${c.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    {c.name}
                  </Link>
                </Td>
                <Td>{c.phone ?? "—"}</Td>
                <Td>{c.email ?? "—"}</Td>
                <Td>{c.address ?? "—"}</Td>
                <Td>{c._count.invoices}</Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
