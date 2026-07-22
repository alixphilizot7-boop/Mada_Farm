"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { BusinessError } from "@/lib/errors";
import { getDictionary } from "@/lib/i18n/locale";
import { formatMessage } from "@/lib/i18n/format-message";

const schema = z.object({
  date: z.string().min(1),
  itemId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().min(0),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

export async function createPurchaseAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = schema.safeParse({
    date: formData.get("date"),
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
    unitCost: formData.get("unitCost"),
    supplier: formData.get("supplier") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  const totalCost = parsed.data.quantity * parsed.data.unitCost;
  const date = new Date(parsed.data.date);

  const purchase = await prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.update({
      where: { id: parsed.data.itemId },
      data: { currentStock: { increment: parsed.data.quantity } },
    });

    const created = await tx.purchase.create({
      data: {
        date,
        itemId: parsed.data.itemId,
        quantity: parsed.data.quantity,
        unitCost: parsed.data.unitCost,
        totalCost,
        supplier: parsed.data.supplier,
        notes: parsed.data.notes,
        recordedById: user.id,
      },
    });

    await tx.cashTransaction.create({
      data: {
        date,
        type: "EXPENSE",
        category: `${item.type} purchase`,
        amount: totalCost,
        description: `${parsed.data.quantity} ${item.unit} of ${item.name}${parsed.data.supplier ? ` from ${parsed.data.supplier}` : ""}`,
        purchaseId: created.id,
        recordedById: user.id,
      },
    });

    return { ...created, item };
  });

  await logAudit({
    entity: "Purchase",
    entityId: purchase.id,
    action: "CREATE",
    summary: `Purchased ${purchase.quantity} ${purchase.item.unit} of ${purchase.item.name} for ${totalCost}`,
    userId: user.id,
  });

  revalidatePath("/inventory");
  revalidatePath("/inventory/purchases");
  revalidatePath("/cashflow");
  revalidatePath("/");
}

const updateSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  itemId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().min(0),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

export async function updatePurchaseAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    date: formData.get("date"),
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
    unitCost: formData.get("unitCost"),
    supplier: formData.get("supplier") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  const totalCost = parsed.data.quantity * parsed.data.unitCost;
  const date = new Date(parsed.data.date);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.purchase.findUniqueOrThrow({
        where: { id: parsed.data.id },
        include: { cashTxn: true, item: true },
      });

      if (existing.itemId === parsed.data.itemId) {
        const delta = parsed.data.quantity - existing.quantity;
        if (delta !== 0) {
          const projected = existing.item.currentStock + delta;
          if (projected < 0) {
            throw new BusinessError(
              formatMessage(t.inventory.purchasesPage.errorReduce, {
                stock: existing.item.currentStock,
                unit: existing.item.unit,
                name: existing.item.name,
              })
            );
          }
          await tx.inventoryItem.update({ where: { id: parsed.data.itemId }, data: { currentStock: { increment: delta } } });
        }
      } else {
        if (existing.item.currentStock - existing.quantity < 0) {
          throw new BusinessError(
            formatMessage(t.inventory.purchasesPage.errorMove, {
              name: existing.item.name,
              stock: existing.item.currentStock,
              unit: existing.item.unit,
            })
          );
        }
        await tx.inventoryItem.update({ where: { id: existing.itemId }, data: { currentStock: { decrement: existing.quantity } } });
        await tx.inventoryItem.update({ where: { id: parsed.data.itemId }, data: { currentStock: { increment: parsed.data.quantity } } });
      }

      const newItem = await tx.inventoryItem.findUniqueOrThrow({ where: { id: parsed.data.itemId } });

      const updated = await tx.purchase.update({
        where: { id: parsed.data.id },
        data: {
          date,
          itemId: parsed.data.itemId,
          quantity: parsed.data.quantity,
          unitCost: parsed.data.unitCost,
          totalCost,
          supplier: parsed.data.supplier ?? null,
          notes: parsed.data.notes ?? null,
        },
      });

      if (existing.cashTxn) {
        await tx.cashTransaction.update({
          where: { id: existing.cashTxn.id },
          data: {
            date,
            category: `${newItem.type} purchase`,
            amount: totalCost,
            description: `${parsed.data.quantity} ${newItem.unit} of ${newItem.name}${parsed.data.supplier ? ` from ${parsed.data.supplier}` : ""}`,
          },
        });
      }

      return { existing, updated, newItem };
    });

    await logAudit({
      entity: "Purchase",
      entityId: result.updated.id,
      action: "UPDATE",
      summary: `Updated purchase of ${result.newItem.name} to ${result.updated.quantity} ${result.newItem.unit} for ${totalCost}`,
      userId: user.id,
    });

    revalidatePath("/inventory");
    revalidatePath("/inventory/purchases");
    revalidatePath(`/inventory/${result.existing.itemId}`);
    if (result.existing.itemId !== result.newItem.id) revalidatePath(`/inventory/${result.newItem.id}`);
    revalidatePath("/cashflow");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof BusinessError) return error.message;
    throw error;
  }
}
