import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui";
import { InvoiceForm } from "./invoice-form";

export default async function NewInvoicePage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="New Invoice" description="Bill a customer for eggs, chicks or chicken sold." />
      {customers.length === 0 ? (
        <EmptyState>Add a customer first on the Customers page.</EmptyState>
      ) : (
        <InvoiceForm customers={customers} />
      )}
    </div>
  );
}
