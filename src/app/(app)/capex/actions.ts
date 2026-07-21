"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";

const itemSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  specs: z.string().optional(),
  plannedQuantity: z.coerce.number().min(0).optional(),
  plannedUnitCost: z.coerce.number().min(0).optional(),
  status: z.enum(["PLANNED", "DEFERRED"]).optional(),
  supplier: z.string().optional(),
  link: z.string().optional(),
  notes: z.string().optional(),
});

function plannedTotalOf(quantity?: number, unitCost?: number) {
  return quantity !== undefined && unitCost !== undefined ? quantity * unitCost : undefined;
}

export async function createCapexItemAction(_prevState: string | undefined, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = itemSchema.safeParse({
    category: formData.get("category"),
    name: formData.get("name"),
    specs: formData.get("specs") || undefined,
    plannedQuantity: formData.get("plannedQuantity") || undefined,
    plannedUnitCost: formData.get("plannedUnitCost") || undefined,
    status: formData.get("status") || undefined,
    supplier: formData.get("supplier") || undefined,
    link: formData.get("link") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return "Please fill in the required fields correctly.";

  const item = await prisma.capexItem.create({
    data: {
      ...parsed.data,
      status: parsed.data.status ?? "PLANNED",
      plannedTotal: plannedTotalOf(parsed.data.plannedQuantity, parsed.data.plannedUnitCost),
      createdById: admin.id,
    },
  });

  await logAudit({
    entity: "CapexItem",
    entityId: item.id,
    action: "CREATE",
    summary: `Added construction/equipment item "${item.name}" (${item.category})`,
    userId: admin.id,
  });

  revalidatePath("/capex");
}

const updateSchema = itemSchema.extend({ id: z.string().min(1) });

export async function updateCapexItemAction(_prevState: string | undefined, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    category: formData.get("category"),
    name: formData.get("name"),
    specs: formData.get("specs") || undefined,
    plannedQuantity: formData.get("plannedQuantity") || undefined,
    plannedUnitCost: formData.get("plannedUnitCost") || undefined,
    status: formData.get("status") || undefined,
    supplier: formData.get("supplier") || undefined,
    link: formData.get("link") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return "Please fill in the required fields correctly.";

  const item = await prisma.capexItem.update({
    where: { id: parsed.data.id },
    data: {
      category: parsed.data.category,
      name: parsed.data.name,
      specs: parsed.data.specs ?? null,
      plannedQuantity: parsed.data.plannedQuantity ?? null,
      plannedUnitCost: parsed.data.plannedUnitCost ?? null,
      plannedTotal: plannedTotalOf(parsed.data.plannedQuantity, parsed.data.plannedUnitCost) ?? null,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      supplier: parsed.data.supplier ?? null,
      link: parsed.data.link ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  await logAudit({
    entity: "CapexItem",
    entityId: item.id,
    action: "UPDATE",
    summary: `Updated construction/equipment item "${item.name}"`,
    userId: admin.id,
  });

  revalidatePath("/capex");
  revalidatePath(`/capex/${item.id}`);
}

export async function markCapexOrderedAction(id: string) {
  const admin = await requireAdmin();

  const item = await prisma.capexItem.update({ where: { id }, data: { status: "ORDERED" } });

  await logAudit({
    entity: "CapexItem",
    entityId: item.id,
    action: "UPDATE",
    summary: `Marked "${item.name}" as ordered`,
    userId: admin.id,
  });

  revalidatePath("/capex");
}

const recordPurchaseSchema = z.object({
  id: z.string().min(1),
  actualQuantity: z.coerce.number().positive(),
  actualUnitCost: z.coerce.number().min(0),
  purchaseDate: z.string().min(1),
});

export async function recordCapexPurchaseAction(_prevState: string | undefined, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = recordPurchaseSchema.safeParse({
    id: formData.get("id"),
    actualQuantity: formData.get("actualQuantity"),
    actualUnitCost: formData.get("actualUnitCost"),
    purchaseDate: formData.get("purchaseDate"),
  });
  if (!parsed.success) return "Enter a valid quantity, unit cost and date.";

  const actualTotal = parsed.data.actualQuantity * parsed.data.actualUnitCost;
  const date = new Date(parsed.data.purchaseDate);

  const item = await prisma.$transaction(async (tx) => {
    const existing = await tx.capexItem.findUniqueOrThrow({ where: { id: parsed.data.id }, include: { cashTxn: true } });

    const updated = await tx.capexItem.update({
      where: { id: parsed.data.id },
      data: {
        status: "PURCHASED",
        actualQuantity: parsed.data.actualQuantity,
        actualUnitCost: parsed.data.actualUnitCost,
        actualTotal,
        purchaseDate: date,
      },
    });

    const description = `${updated.name}${updated.supplier ? ` (${updated.supplier})` : ""}`;

    if (existing.cashTxn) {
      await tx.cashTransaction.update({
        where: { id: existing.cashTxn.id },
        data: { date, amount: actualTotal, category: updated.category, description },
      });
    } else {
      await tx.cashTransaction.create({
        data: {
          date,
          type: "EXPENSE",
          category: updated.category,
          amount: actualTotal,
          description,
          capexItemId: updated.id,
          recordedById: admin.id,
        },
      });
    }

    return updated;
  });

  await logAudit({
    entity: "CapexItem",
    entityId: item.id,
    action: "UPDATE",
    summary: `Recorded purchase of "${item.name}" for ${actualTotal}`,
    userId: admin.id,
  });

  revalidatePath("/capex");
  revalidatePath("/cashflow");
  revalidatePath("/");
}

export async function revertCapexToPlannedAction(id: string) {
  const admin = await requireAdmin();

  const item = await prisma.$transaction(async (tx) => {
    const existing = await tx.capexItem.findUniqueOrThrow({ where: { id }, include: { cashTxn: true } });

    if (existing.cashTxn) {
      await tx.cashTransaction.delete({ where: { id: existing.cashTxn.id } });
    }

    return tx.capexItem.update({
      where: { id },
      data: {
        status: "PLANNED",
        actualQuantity: null,
        actualUnitCost: null,
        actualTotal: null,
        purchaseDate: null,
      },
    });
  });

  await logAudit({
    entity: "CapexItem",
    entityId: item.id,
    action: "UPDATE",
    summary: `Reverted "${item.name}" back to planned (purchase undone)`,
    userId: admin.id,
  });

  revalidatePath("/capex");
  revalidatePath("/cashflow");
  revalidatePath("/");
}
