"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(1),
  type: z.enum(["FEED", "WATER", "SUPPLEMENT", "MEDICINE", "OTHER"]),
  unit: z.string().min(1),
  reorderLevel: z.coerce.number().min(0).default(0),
});

export async function createItemAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = schema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    unit: formData.get("unit"),
    reorderLevel: formData.get("reorderLevel") || 0,
  });
  if (!parsed.success) return "Please fill in the required fields correctly.";

  const existing = await prisma.inventoryItem.findUnique({ where: { name: parsed.data.name } });
  if (existing) return "An inventory item with that name already exists.";

  const item = await prisma.inventoryItem.create({ data: parsed.data });

  await logAudit({
    entity: "InventoryItem",
    entityId: item.id,
    action: "CREATE",
    summary: `Created inventory item "${item.name}" (${item.type})`,
    userId: user.id,
  });

  revalidatePath("/inventory");
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["FEED", "WATER", "SUPPLEMENT", "MEDICINE", "OTHER"]),
  unit: z.string().min(1),
  reorderLevel: z.coerce.number().min(0).default(0),
});

export async function updateItemAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    type: formData.get("type"),
    unit: formData.get("unit"),
    reorderLevel: formData.get("reorderLevel") || 0,
  });
  if (!parsed.success) return "Please fill in the required fields correctly.";

  const duplicate = await prisma.inventoryItem.findFirst({
    where: { name: parsed.data.name, NOT: { id: parsed.data.id } },
  });
  if (duplicate) return "An inventory item with that name already exists.";

  const item = await prisma.inventoryItem.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      unit: parsed.data.unit,
      reorderLevel: parsed.data.reorderLevel,
    },
  });

  await logAudit({
    entity: "InventoryItem",
    entityId: item.id,
    action: "UPDATE",
    summary: `Updated inventory item "${item.name}"`,
    userId: user.id,
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${item.id}`);
}

const adjustSchema = z.object({
  id: z.string().min(1),
  newStock: z.coerce.number().min(0),
  reason: z.string().min(1),
});

export async function adjustStockAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = adjustSchema.safeParse({
    id: formData.get("id"),
    newStock: formData.get("newStock"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return "Enter a valid stock quantity and a reason for the adjustment.";

  const before = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: parsed.data.id } });
  const item = await prisma.inventoryItem.update({
    where: { id: parsed.data.id },
    data: { currentStock: parsed.data.newStock },
  });

  await logAudit({
    entity: "InventoryItem",
    entityId: item.id,
    action: "UPDATE",
    summary: `Manually adjusted stock of "${item.name}" from ${before.currentStock} to ${item.currentStock} ${item.unit} — ${parsed.data.reason}`,
    userId: user.id,
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${item.id}`);
}
