import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { InvoiceForm } from "../../new/invoice-form";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();

  const { id } = await params;
  const [invoice, customers] = await Promise.all([
    prisma.invoice.findUnique({ where: { id }, include: { items: true } }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!invoice) notFound();

  return (
    <div>
      <PageHeader title={`${t.invoices.edit} ${invoice.invoiceNumber}`} />
      <InvoiceForm customers={customers} invoice={invoice} />
    </div>
  );
}
