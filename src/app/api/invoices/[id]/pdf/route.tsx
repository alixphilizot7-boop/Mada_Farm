import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/lib/format";
import { InvoicePdf } from "@/components/invoice-pdf";
import { requireAdmin, AuthError } from "@/lib/require-user";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) return new Response("Unauthorized", { status: 403 });
    throw error;
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!invoice) return new Response("Not found", { status: 404 });

  const buffer = await renderToBuffer(
    <InvoicePdf
      invoiceNumber={invoice.invoiceNumber}
      issueDate={formatDate(invoice.issueDate)}
      dueDate={invoice.dueDate ? formatDate(invoice.dueDate) : undefined}
      customerName={invoice.customer.name}
      customerAddress={invoice.customer.address ?? undefined}
      customerPhone={invoice.customer.phone ?? undefined}
      items={invoice.items.map((item) => ({
        productType: item.productType,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      }))}
      subtotal={invoice.subtotal}
      tax={invoice.tax}
      total={invoice.total}
      notes={invoice.notes ?? undefined}
      formatMoney={formatMoney}
    />
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
