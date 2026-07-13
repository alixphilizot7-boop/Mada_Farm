import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LinkButton, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { InvoicesTable } from "./invoices-table";

export default async function InvoicesPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();

  const invoices = await prisma.invoice.findMany({
    orderBy: { issueDate: "desc" },
    include: { customer: true },
    take: 200,
  });

  return (
    <div>
      <PageHeader
        title={t.invoices.title}
        description={t.invoices.description}
        action={<LinkButton href="/invoices/new">{t.invoices.newInvoice}</LinkButton>}
      />
      <InvoicesTable invoices={invoices} />
    </div>
  );
}
