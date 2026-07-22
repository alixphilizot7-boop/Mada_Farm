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
  flockId: z.string().optional(),
  quantity: z.coerce.number().positive(),
  notes: z.string().optional(),
});

export async function createUsageAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = schema.safeParse({
    date: formData.get("date"),
    itemId: formData.get("itemId"),
    flockId: formData.get("flockId") || undefined,
    quantity: formData.get("quantity"),
    notes: formData.get("notes") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  const item = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: parsed.data.itemId } });
  if (parsed.data.quantity > item.currentStock) {
    return formatMessage(t.common.notEnoughStock, { stock: item.currentStock, unit: item.unit, name: item.name });
  }

  const usage = await prisma.$transaction(async (tx) => {
    await tx.inventoryItem.update({
      where: { id: parsed.data.itemId },
      data: { currentStock: { decrement: parsed.data.quantity } },
    });

    return tx.usage.create({
      data: {
        date: new Date(parsed.data.date),
        itemId: parsed.data.itemId,
        flockId: parsed.data.flockId,
        quantity: parsed.data.quantity,
        notes: parsed.data.notes,
        recordedById: user.id,
      },
      include: { item: true, flock: true },
    });
  });

  await logAudit({
    entity: "Usage",
    entityId: usage.id,
    action: "CREATE",
    summary: `Gave ${usage.quantity} ${usage.item.unit} of ${usage.item.name}${usage.flock ? ` to flock "${usage.flock.name}"` : ""}`,
    userId: user.id,
  });

  revalidatePath("/inventory");
  revalidatePath("/inventory/usage");
  if (usage.flockId) revalidatePath(`/flocks/${usage.flockId}`);
}

const updateSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  itemId: z.string().min(1),
  flockId: z.string().optional(),
  quantity: z.coerce.number().positive(),
  notes: z.string().optional(),
});

export async function updateUsageAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    date: formData.get("date"),
    itemId: formData.get("itemId"),
    flockId: formData.get("flockId") || undefined,
    quantity: formData.get("quantity"),
    notes: formData.get("notes") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.usage.findUniqueOrThrow({ where: { id: parsed.data.id }, include: { item: true } });

      if (existing.itemId === parsed.data.itemId) {
        const delta = parsed.data.quantity - existing.quantity;
        if (delta !== 0) {
          const projected = existing.item.currentStock - delta;
          if (projected < 0) {
            throw new BusinessError(formatMessage(t.common.notEnoughStock, { stock: existing.item.currentStock, unit: existing.item.unit, name: existing.item.name }));
          }
          await tx.inventoryItem.update({ where: { id: parsed.data.itemId }, data: { currentStock: { decrement: delta } } });
        }
      } else {
        const newItem = await tx.inventoryItem.findUniqueOrThrow({ where: { id: parsed.data.itemId } });
        if (parsed.data.quantity > newItem.currentStock) {
          throw new BusinessError(formatMessage(t.common.notEnoughStock, { stock: newItem.currentStock, unit: newItem.unit, name: newItem.name }));
        }
        await tx.inventoryItem.update({ where: { id: existing.itemId }, data: { currentStock: { increment: existing.quantity } } });
        await tx.inventoryItem.update({ where: { id: parsed.data.itemId }, data: { currentStock: { decrement: parsed.data.quantity } } });
      }

      const updated = await tx.usage.update({
        where: { id: parsed.data.id },
        data: {
          date: new Date(parsed.data.date),
          itemId: parsed.data.itemId,
          flockId: parsed.data.flockId ?? null,
          quantity: parsed.data.quantity,
          notes: parsed.data.notes ?? null,
        },
        include: { item: true, flock: true },
      });

      return { existing, updated };
    });

    await logAudit({
      entity: "Usage",
      entityId: result.updated.id,
      action: "UPDATE",
      summary: `Updated usage: ${result.updated.quantity} ${result.updated.item.unit} of ${result.updated.item.name}${result.updated.flock ? ` for flock "${result.updated.flock.name}"` : ""}`,
      userId: user.id,
    });

    revalidatePath("/inventory");
    revalidatePath("/inventory/usage");
    revalidatePath(`/inventory/${result.existing.itemId}`);
    if (result.existing.itemId !== result.updated.itemId) revalidatePath(`/inventory/${result.updated.itemId}`);
    if (result.existing.flockId) revalidatePath(`/flocks/${result.existing.flockId}`);
    if (result.updated.flockId && result.updated.flockId !== result.existing.flockId) revalidatePath(`/flocks/${result.updated.flockId}`);
  } catch (error) {
    if (error instanceof BusinessError) return error.message;
    throw error;
  }
}
