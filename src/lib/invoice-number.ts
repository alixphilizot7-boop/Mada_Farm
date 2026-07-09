import { prisma } from "@/lib/prisma";

export async function nextInvoiceNumber(date = new Date()) {
  const year = date.getFullYear();
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: `INV-${year}-` } },
  });
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}
