import { prisma } from "@/lib/prisma";
import type { CashType } from "@prisma/client";

export async function createCashTransaction(params: {
  date: Date;
  type: CashType;
  category: string;
  amount: number;
  description?: string;
  recordedById: string;
  invoiceId?: string;
  purchaseId?: string;
  healthRecordId?: string;
}) {
  if (!params.amount) return null;
  return prisma.cashTransaction.create({ data: params });
}
