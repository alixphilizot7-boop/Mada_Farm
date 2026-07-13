import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { InvoiceForm } from "./invoice-form";

export default async function NewInvoicePage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();

  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title={t.invoices.newTitle} description={t.invoices.newDescription} />
      {customers.length === 0 ? (
        <EmptyState>{t.invoices.needCustomerFirst}</EmptyState>
      ) : (
        <InvoiceForm customers={customers} />
      )}
    </div>
  );
}
