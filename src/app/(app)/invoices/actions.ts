"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { nextInvoiceNumber } from "@/lib/invoice-number";
import { getDictionary } from "@/lib/i18n/locale";
import { formatMessage } from "@/lib/i18n/format-message";
import type { InvoiceStatus } from "@prisma/client";

const itemSchema = z.object({
  productType: z.enum(["EGGS", "CHICKS", "CHICKEN", "OTHER"]),
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
});

export async function createInvoiceAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireAdmin();
  const { t } = await getDictionary();

  const customerId = formData.get("customerId");
  const issueDate = formData.get("issueDate");
  const dueDate = formData.get("dueDate");
  const taxRate = Number(formData.get("taxRate") || 0);
  const notes = formData.get("notes");

  if (typeof customerId !== "string" || !customerId) return t.invoices.errorSelectCustomer;
  if (typeof issueDate !== "string" || !issueDate) return t.invoices.errorSetIssueDate;

  const productTypes = formData.getAll("productType");
  const descriptions = formData.getAll("description");
  const quantities = formData.getAll("quantity");
  const unitPrices = formData.getAll("unitPrice");

  if (productTypes.length === 0) return t.invoices.errorAddLineItem;

  const items: { productType: "EGGS" | "CHICKS" | "CHICKEN" | "OTHER"; description: string; quantity: number; unitPrice: number; total: number }[] = [];
  for (let i = 0; i < productTypes.length; i++) {
    const parsed = itemSchema.safeParse({
      productType: productTypes[i],
      description: descriptions[i],
      quantity: quantities[i],
      unitPrice: unitPrices[i],
    });
    if (!parsed.success) return formatMessage(t.invoices.errorLineItemInvalid, { index: i + 1 });
    items.push({ ...parsed.data, total: parsed.data.quantity * parsed.data.unitPrice });
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  const parsedIssueDate = new Date(issueDate);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: await nextInvoiceNumber(parsedIssueDate),
      customerId,
      issueDate: parsedIssueDate,
      dueDate: typeof dueDate === "string" && dueDate ? new Date(dueDate) : undefined,
      subtotal,
      tax,
      total,
      notes: typeof notes === "string" && notes ? notes : undefined,
      createdById: user.id,
      items: { create: items },
    },
  });

  await logAudit({
    entity: "Invoice",
    entityId: invoice.id,
    action: "CREATE",
    summary: `Created invoice ${invoice.invoiceNumber} for ${total}`,
    userId: user.id,
  });

  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoiceAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireAdmin();
  const { t } = await getDictionary();

  const id = formData.get("id");
  const customerId = formData.get("customerId");
  const issueDate = formData.get("issueDate");
  const dueDate = formData.get("dueDate");
  const taxRate = Number(formData.get("taxRate") || 0);
  const notes = formData.get("notes");

  if (typeof id !== "string" || !id) return t.common.missingRecord;
  if (typeof customerId !== "string" || !customerId) return t.invoices.errorSelectCustomer;
  if (typeof issueDate !== "string" || !issueDate) return t.invoices.errorSetIssueDate;

  const productTypes = formData.getAll("productType");
  const descriptions = formData.getAll("description");
  const quantities = formData.getAll("quantity");
  const unitPrices = formData.getAll("unitPrice");

  if (productTypes.length === 0) return t.invoices.errorAddLineItem;

  const items: { productType: "EGGS" | "CHICKS" | "CHICKEN" | "OTHER"; description: string; quantity: number; unitPrice: number; total: number }[] = [];
  for (let i = 0; i < productTypes.length; i++) {
    const parsed = itemSchema.safeParse({
      productType: productTypes[i],
      description: descriptions[i],
      quantity: quantities[i],
      unitPrice: unitPrices[i],
    });
    if (!parsed.success) return formatMessage(t.invoices.errorLineItemInvalid, { index: i + 1 });
    items.push({ ...parsed.data, total: parsed.data.quantity * parsed.data.unitPrice });
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  const parsedIssueDate = new Date(issueDate);

  const invoice = await prisma.$transaction(async (tx) => {
    const existing = await tx.invoice.findUniqueOrThrow({ where: { id }, include: { cashTxn: true, customer: true } });

    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

    const updated = await tx.invoice.update({
      where: { id },
      data: {
        customerId,
        issueDate: parsedIssueDate,
        dueDate: typeof dueDate === "string" && dueDate ? new Date(dueDate) : null,
        subtotal,
        tax,
        total,
        notes: typeof notes === "string" && notes ? notes : null,
        items: { create: items },
      },
      include: { customer: true },
    });

    if (existing.cashTxn) {
      await tx.cashTransaction.update({
        where: { id: existing.cashTxn.id },
        data: {
          amount: total,
          description: `Invoice ${updated.invoiceNumber} — ${updated.customer.name}`,
        },
      });
    }

    return updated;
  });

  await logAudit({
    entity: "Invoice",
    entityId: invoice.id,
    action: "UPDATE",
    summary: `Updated invoice ${invoice.invoiceNumber} (total ${total})`,
    userId: user.id,
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath("/cashflow");
  revalidatePath("/");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoiceStatusAction(invoiceId: string, status: InvoiceStatus) {
  const user = await requireAdmin();

  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { customer: true, cashTxn: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { status, paidAt: status === "PAID" ? new Date() : status === invoice.status ? invoice.paidAt : null },
    });

    if (status === "PAID" && !invoice.cashTxn) {
      await tx.cashTransaction.create({
        data: {
          date: new Date(),
          type: "INCOME",
          category: "Sales",
          amount: invoice.total,
          description: `Invoice ${invoice.invoiceNumber} — ${invoice.customer.name}`,
          invoiceId: invoice.id,
          recordedById: user.id,
        },
      });
    } else if (status !== "PAID" && invoice.cashTxn) {
      // Cash flow should only ever reflect invoices that are actually paid.
      await tx.cashTransaction.delete({ where: { id: invoice.cashTxn.id } });
    }
  });

  await logAudit({
    entity: "Invoice",
    entityId: invoiceId,
    action: "UPDATE",
    summary: `Invoice ${invoice.invoiceNumber} marked ${status}`,
    userId: user.id,
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/cashflow");
  revalidatePath("/");
}
