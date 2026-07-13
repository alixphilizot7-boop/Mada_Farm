import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LinkButton, PageHeader } from "@/components/ui";
import { InvoicesTable } from "./invoices-table";

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
      <InvoicesTable invoices={invoices} />
    </div>
  );
}
