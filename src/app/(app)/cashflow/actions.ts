"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { getDictionary } from "@/lib/i18n/locale";

const schema = z.object({
  date: z.string().min(1),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
});

export async function createManualCashTransactionAction(
  _prevState: string | undefined,
  formData: FormData
) {
  const admin = await requireAdmin();

  const parsed = schema.safeParse({
    date: formData.get("date"),
    type: formData.get("type"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  const txn = await prisma.cashTransaction.create({
    data: {
      date: new Date(parsed.data.date),
      type: parsed.data.type,
      category: parsed.data.category,
      amount: parsed.data.amount,
      description: parsed.data.description,
      recordedById: admin.id,
    },
  });

  await logAudit({
    entity: "CashTransaction",
    entityId: txn.id,
    action: "CREATE",
    summary: `Manual ${txn.type.toLowerCase()} entry: ${txn.category} (${txn.amount})`,
    userId: admin.id,
  });

  revalidatePath("/cashflow");
  revalidatePath("/");
}

const updateSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
});

export async function updateManualCashTransactionAction(
  _prevState: string | undefined,
  formData: FormData
) {
  const admin = await requireAdmin();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    date: formData.get("date"),
    type: formData.get("type"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  const existing = await prisma.cashTransaction.findUniqueOrThrow({ where: { id: parsed.data.id } });
  if (existing.invoiceId || existing.purchaseId || existing.healthRecordId || existing.capexItemId) {
    return t.cashflow.errorEditElsewhere;
  }

  const txn = await prisma.cashTransaction.update({
    where: { id: parsed.data.id },
    data: {
      date: new Date(parsed.data.date),
      type: parsed.data.type,
      category: parsed.data.category,
      amount: parsed.data.amount,
      description: parsed.data.description ?? null,
    },
  });

  await logAudit({
    entity: "CashTransaction",
    entityId: txn.id,
    action: "UPDATE",
    summary: `Updated manual ${txn.type.toLowerCase()} entry: ${txn.category} (${txn.amount})`,
    userId: admin.id,
  });

  revalidatePath("/cashflow");
  revalidatePath("/");
}
