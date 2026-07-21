"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { BusinessError } from "@/lib/errors";

const schema = z.object({
  date: z.string().min(1),
  flockId: z.string().min(1),
  eggsCollected: z.coerce.number().int().min(0).default(0),
  mortalityCount: z.coerce.number().int().min(0).default(0),
  mortalityCause: z.string().optional(),
  feedItemId: z.string().optional(),
  feedQuantity: z.coerce.number().min(0).default(0),
  sickCount: z.coerce.number().int().min(0).default(0),
  sickNotes: z.string().optional(),
  eggsSold: z.coerce.number().int().min(0).default(0),
  chicksSold: z.coerce.number().int().min(0).default(0),
  saleAmount: z.coerce.number().min(0).default(0),
  saleAmountAriary: z.coerce.number().min(0).default(0),
  weather: z.string().optional(),
  notes: z.string().optional(),
});

function parseForm(formData: FormData) {
  return schema.safeParse({
    date: formData.get("date"),
    flockId: formData.get("flockId"),
    eggsCollected: formData.get("eggsCollected") || 0,
    mortalityCount: formData.get("mortalityCount") || 0,
    mortalityCause: formData.get("mortalityCause") || undefined,
    feedItemId: formData.get("feedItemId") || undefined,
    feedQuantity: formData.get("feedQuantity") || 0,
    sickCount: formData.get("sickCount") || 0,
    sickNotes: formData.get("sickNotes") || undefined,
    eggsSold: formData.get("eggsSold") || 0,
    chicksSold: formData.get("chicksSold") || 0,
    saleAmount: formData.get("saleAmount") || 0,
    saleAmountAriary: formData.get("saleAmountAriary") || 0,
    weather: formData.get("weather") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

function saleDescription(eggsSold: number, chicksSold: number) {
  const parts: string[] = [];
  if (eggsSold > 0) parts.push(`${eggsSold} eggs`);
  if (chicksSold > 0) parts.push(`${chicksSold} chicks`);
  return parts.length > 0 ? `Direct sale: ${parts.join(", ")}` : "Direct sale";
}

function revalidateAll(flockId: string) {
  revalidatePath("/journal");
  revalidatePath("/eggs");
  revalidatePath("/mortality");
  revalidatePath("/inventory");
  revalidatePath("/inventory/usage");
  revalidatePath("/health");
  revalidatePath("/cashflow");
  revalidatePath(`/flocks/${flockId}`);
  revalidatePath("/flocks");
  revalidatePath("/");
}

export async function createDailyLogAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);
  if (!parsed.success) return "Please fill in the required fields correctly.";
  const d = parsed.data;
  const date = new Date(d.date);

  if (d.mortalityCount > 0) {
    const flock = await prisma.flock.findUniqueOrThrow({ where: { id: d.flockId } });
    if (d.mortalityCount > flock.currentCount) {
      return `Only ${flock.currentCount} birds remain in this flock.`;
    }
  }
  if (d.feedItemId && d.feedQuantity > 0) {
    const item = await prisma.inventoryItem.findUniqueOrThrow({ where: { id: d.feedItemId } });
    if (d.feedQuantity > item.currentStock) {
      return `Not enough stock: only ${item.currentStock} ${item.unit} of ${item.name} available.`;
    }
  }

  try {
    const log = await prisma.$transaction(async (tx) => {
      let eggLogId: string | undefined;
      if (d.eggsCollected > 0) {
        const eggLog = await tx.eggLog.create({
          data: { date, flockId: d.flockId, wholeCount: d.eggsCollected, recordedById: user.id },
        });
        eggLogId = eggLog.id;
      }

      let mortalityLogId: string | undefined;
      if (d.mortalityCount > 0) {
        await tx.flock.update({ where: { id: d.flockId }, data: { currentCount: { decrement: d.mortalityCount } } });
        const mortalityLog = await tx.mortalityLog.create({
          data: { date, flockId: d.flockId, quantity: d.mortalityCount, cause: d.mortalityCause, recordedById: user.id },
        });
        mortalityLogId = mortalityLog.id;
      }

      let usageId: string | undefined;
      if (d.feedItemId && d.feedQuantity > 0) {
        await tx.inventoryItem.update({ where: { id: d.feedItemId }, data: { currentStock: { decrement: d.feedQuantity } } });
        const usage = await tx.usage.create({
          data: { date, itemId: d.feedItemId, flockId: d.flockId, quantity: d.feedQuantity, recordedById: user.id },
        });
        usageId = usage.id;
      }

      let healthRecordId: string | undefined;
      if (d.sickCount > 0 || d.sickNotes) {
        const health = await tx.healthRecord.create({
          data: {
            date,
            flockId: d.flockId,
            type: "ILLNESS",
            affectedCount: d.sickCount,
            diagnosis: d.sickNotes,
            outcome: "ONGOING",
            recordedById: user.id,
          },
        });
        healthRecordId = health.id;
      }

      let cashTxnId: string | undefined;
      if (d.saleAmount > 0 || d.saleAmountAriary > 0) {
        const cashTxn = await tx.cashTransaction.create({
          data: {
            date,
            type: "INCOME",
            category: "Direct sale",
            amount: d.saleAmount,
            amountAriary: d.saleAmountAriary > 0 ? d.saleAmountAriary : null,
            description: saleDescription(d.eggsSold, d.chicksSold),
            recordedById: user.id,
          },
        });
        cashTxnId = cashTxn.id;
      }

      return tx.dailyLog.create({
        data: {
          date,
          flockId: d.flockId,
          weather: d.weather,
          notes: d.notes,
          eggsSold: d.eggsSold,
          chicksSold: d.chicksSold,
          eggLogId,
          mortalityLogId,
          usageId,
          healthRecordId,
          cashTxnId,
          recordedById: user.id,
        },
        include: { flock: true },
      });
    });

    await logAudit({
      entity: "DailyLog",
      entityId: log.id,
      action: "CREATE",
      summary: `Logged daily entry for flock "${log.flock.name}"`,
      userId: user.id,
    });

    revalidateAll(d.flockId);
  } catch (error) {
    if (error instanceof BusinessError) return error.message;
    throw error;
  }
}

const updateSchema = schema.extend({ id: z.string().min(1) });

export async function updateDailyLogAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    date: formData.get("date"),
    flockId: formData.get("flockId"),
    eggsCollected: formData.get("eggsCollected") || 0,
    mortalityCount: formData.get("mortalityCount") || 0,
    mortalityCause: formData.get("mortalityCause") || undefined,
    feedItemId: formData.get("feedItemId") || undefined,
    feedQuantity: formData.get("feedQuantity") || 0,
    sickCount: formData.get("sickCount") || 0,
    sickNotes: formData.get("sickNotes") || undefined,
    eggsSold: formData.get("eggsSold") || 0,
    chicksSold: formData.get("chicksSold") || 0,
    saleAmount: formData.get("saleAmount") || 0,
    saleAmountAriary: formData.get("saleAmountAriary") || 0,
    weather: formData.get("weather") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return "Please fill in the required fields correctly.";
  const d = parsed.data;
  const date = new Date(d.date);

  try {
    const log = await prisma.$transaction(async (tx) => {
      const existing = await tx.dailyLog.findUniqueOrThrow({
        where: { id: d.id },
        include: { eggLog: true, mortalityLog: true, usage: true, healthRecord: true, cashTxn: true },
      });
      const flockId = existing.flockId;

      // Eggs
      let eggLogId = existing.eggLogId ?? undefined;
      if (d.eggsCollected > 0) {
        if (existing.eggLog) {
          await tx.eggLog.update({ where: { id: existing.eggLog.id }, data: { date, wholeCount: d.eggsCollected } });
        } else {
          const created = await tx.eggLog.create({
            data: { date, flockId, wholeCount: d.eggsCollected, recordedById: user.id },
          });
          eggLogId = created.id;
        }
      } else if (existing.eggLog) {
        await tx.eggLog.delete({ where: { id: existing.eggLog.id } });
        eggLogId = undefined;
      }

      // Mortality (adjusts flock currentCount)
      let mortalityLogId = existing.mortalityLogId ?? undefined;
      if (d.mortalityCount > 0) {
        if (existing.mortalityLog) {
          const delta = d.mortalityCount - existing.mortalityLog.quantity;
          if (delta !== 0) {
            const flock = await tx.flock.findUniqueOrThrow({ where: { id: flockId } });
            if (delta > flock.currentCount) {
              throw new BusinessError(`Only ${flock.currentCount} birds remain in this flock.`);
            }
            await tx.flock.update({ where: { id: flockId }, data: { currentCount: { decrement: delta } } });
          }
          await tx.mortalityLog.update({
            where: { id: existing.mortalityLog.id },
            data: { date, quantity: d.mortalityCount, cause: d.mortalityCause ?? null },
          });
        } else {
          const flock = await tx.flock.findUniqueOrThrow({ where: { id: flockId } });
          if (d.mortalityCount > flock.currentCount) {
            throw new BusinessError(`Only ${flock.currentCount} birds remain in this flock.`);
          }
          await tx.flock.update({ where: { id: flockId }, data: { currentCount: { decrement: d.mortalityCount } } });
          const created = await tx.mortalityLog.create({
            data: { date, flockId, quantity: d.mortalityCount, cause: d.mortalityCause, recordedById: user.id },
          });
          mortalityLogId = created.id;
        }
      } else if (existing.mortalityLog) {
        await tx.flock.update({ where: { id: flockId }, data: { currentCount: { increment: existing.mortalityLog.quantity } } });
        await tx.mortalityLog.delete({ where: { id: existing.mortalityLog.id } });
        mortalityLogId = undefined;
      }

      // Feed usage (adjusts inventory stock)
      let usageId = existing.usageId ?? undefined;
      if (d.feedItemId && d.feedQuantity > 0) {
        if (existing.usage) {
          if (existing.usage.itemId === d.feedItemId) {
            const delta = d.feedQuantity - existing.usage.quantity;
            if (delta !== 0) {
              const item = await tx.inventoryItem.findUniqueOrThrow({ where: { id: d.feedItemId } });
              if (delta > item.currentStock) {
                throw new BusinessError(`Not enough stock: only ${item.currentStock} ${item.unit} of ${item.name} available.`);
              }
              await tx.inventoryItem.update({ where: { id: d.feedItemId }, data: { currentStock: { decrement: delta } } });
            }
          } else {
            await tx.inventoryItem.update({ where: { id: existing.usage.itemId }, data: { currentStock: { increment: existing.usage.quantity } } });
            const newItem = await tx.inventoryItem.findUniqueOrThrow({ where: { id: d.feedItemId } });
            if (d.feedQuantity > newItem.currentStock) {
              throw new BusinessError(`Not enough stock: only ${newItem.currentStock} ${newItem.unit} of ${newItem.name} available.`);
            }
            await tx.inventoryItem.update({ where: { id: d.feedItemId }, data: { currentStock: { decrement: d.feedQuantity } } });
          }
          await tx.usage.update({
            where: { id: existing.usage.id },
            data: { date, itemId: d.feedItemId, quantity: d.feedQuantity },
          });
        } else {
          const item = await tx.inventoryItem.findUniqueOrThrow({ where: { id: d.feedItemId } });
          if (d.feedQuantity > item.currentStock) {
            throw new BusinessError(`Not enough stock: only ${item.currentStock} ${item.unit} of ${item.name} available.`);
          }
          await tx.inventoryItem.update({ where: { id: d.feedItemId }, data: { currentStock: { decrement: d.feedQuantity } } });
          const created = await tx.usage.create({
            data: { date, itemId: d.feedItemId, flockId, quantity: d.feedQuantity, recordedById: user.id },
          });
          usageId = created.id;
        }
      } else if (existing.usage) {
        await tx.inventoryItem.update({ where: { id: existing.usage.itemId }, data: { currentStock: { increment: existing.usage.quantity } } });
        await tx.usage.delete({ where: { id: existing.usage.id } });
        usageId = undefined;
      }

      // Sick / isolated birds
      let healthRecordId = existing.healthRecordId ?? undefined;
      if (d.sickCount > 0 || d.sickNotes) {
        if (existing.healthRecord) {
          await tx.healthRecord.update({
            where: { id: existing.healthRecord.id },
            data: { date, affectedCount: d.sickCount, diagnosis: d.sickNotes ?? null },
          });
        } else {
          const created = await tx.healthRecord.create({
            data: {
              date,
              flockId,
              type: "ILLNESS",
              affectedCount: d.sickCount,
              diagnosis: d.sickNotes,
              outcome: "ONGOING",
              recordedById: user.id,
            },
          });
          healthRecordId = created.id;
        }
      } else if (existing.healthRecord) {
        await tx.healthRecord.delete({ where: { id: existing.healthRecord.id } });
        healthRecordId = undefined;
      }

      // Direct sale
      let cashTxnId = existing.cashTxnId ?? undefined;
      const description = saleDescription(d.eggsSold, d.chicksSold);
      if (d.saleAmount > 0 || d.saleAmountAriary > 0) {
        if (existing.cashTxn) {
          await tx.cashTransaction.update({
            where: { id: existing.cashTxn.id },
            data: { date, amount: d.saleAmount, amountAriary: d.saleAmountAriary > 0 ? d.saleAmountAriary : null, description },
          });
        } else {
          const created = await tx.cashTransaction.create({
            data: {
              date,
              type: "INCOME",
              category: "Direct sale",
              amount: d.saleAmount,
              amountAriary: d.saleAmountAriary > 0 ? d.saleAmountAriary : null,
              description,
              recordedById: user.id,
            },
          });
          cashTxnId = created.id;
        }
      } else if (existing.cashTxn) {
        await tx.cashTransaction.delete({ where: { id: existing.cashTxn.id } });
        cashTxnId = undefined;
      }

      return tx.dailyLog.update({
        where: { id: d.id },
        data: {
          date,
          weather: d.weather ?? null,
          notes: d.notes ?? null,
          eggsSold: d.eggsSold,
          chicksSold: d.chicksSold,
          eggLogId: eggLogId ?? null,
          mortalityLogId: mortalityLogId ?? null,
          usageId: usageId ?? null,
          healthRecordId: healthRecordId ?? null,
          cashTxnId: cashTxnId ?? null,
        },
        include: { flock: true },
      });
    });

    await logAudit({
      entity: "DailyLog",
      entityId: log.id,
      action: "UPDATE",
      summary: `Updated daily entry for flock "${log.flock.name}"`,
      userId: user.id,
    });

    revalidateAll(log.flockId);
  } catch (error) {
    if (error instanceof BusinessError) return error.message;
    throw error;
  }
}
