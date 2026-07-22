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
  flockId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  cause: z.string().optional(),
  notes: z.string().optional(),
});

export async function createMortalityLogAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = schema.safeParse({
    date: formData.get("date"),
    flockId: formData.get("flockId"),
    quantity: formData.get("quantity"),
    cause: formData.get("cause") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  const flock = await prisma.flock.findUniqueOrThrow({ where: { id: parsed.data.flockId } });
  if (parsed.data.quantity > flock.currentCount) {
    return formatMessage(t.common.notEnoughBirds, { count: flock.currentCount });
  }

  const log = await prisma.$transaction(async (tx) => {
    await tx.flock.update({
      where: { id: flock.id },
      data: { currentCount: { decrement: parsed.data.quantity } },
    });

    return tx.mortalityLog.create({
      data: {
        date: new Date(parsed.data.date),
        flockId: parsed.data.flockId,
        quantity: parsed.data.quantity,
        cause: parsed.data.cause,
        notes: parsed.data.notes,
        recordedById: user.id,
      },
      include: { flock: true },
    });
  });

  await logAudit({
    entity: "MortalityLog",
    entityId: log.id,
    action: "CREATE",
    summary: `Recorded loss of ${log.quantity} bird(s) in flock "${log.flock.name}"${log.cause ? ` — ${log.cause}` : ""}`,
    userId: user.id,
  });

  revalidatePath("/mortality");
  revalidatePath(`/flocks/${log.flockId}`);
  revalidatePath("/flocks");
  revalidatePath("/");
}

const updateSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  flockId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  cause: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateMortalityLogAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    date: formData.get("date"),
    flockId: formData.get("flockId"),
    quantity: formData.get("quantity"),
    cause: formData.get("cause") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  const existing = await prisma.mortalityLog.findUniqueOrThrow({ where: { id: parsed.data.id } });
  if (existing.healthRecordId) {
    return t.mortality.errorEditElsewhere;
  }

  try {
    const log = await prisma.$transaction(async (tx) => {
      const sameFlock = existing.flockId === parsed.data.flockId;

      if (!sameFlock) {
        await tx.flock.update({
          where: { id: existing.flockId },
          data: { currentCount: { increment: existing.quantity } },
        });
        const targetFlock = await tx.flock.findUniqueOrThrow({ where: { id: parsed.data.flockId } });
        if (parsed.data.quantity > targetFlock.currentCount) {
          throw new BusinessError(formatMessage(t.common.notEnoughBirds, { count: targetFlock.currentCount }));
        }
        await tx.flock.update({
          where: { id: parsed.data.flockId },
          data: { currentCount: { decrement: parsed.data.quantity } },
        });
      } else {
        const delta = parsed.data.quantity - existing.quantity;
        if (delta !== 0) {
          const flock = await tx.flock.findUniqueOrThrow({ where: { id: parsed.data.flockId } });
          if (delta > flock.currentCount) {
            throw new BusinessError(formatMessage(t.common.notEnoughBirds, { count: flock.currentCount }));
          }
          await tx.flock.update({
            where: { id: parsed.data.flockId },
            data: { currentCount: { decrement: delta } },
          });
        }
      }

      return tx.mortalityLog.update({
        where: { id: parsed.data.id },
        data: {
          date: new Date(parsed.data.date),
          flockId: parsed.data.flockId,
          quantity: parsed.data.quantity,
          cause: parsed.data.cause ?? null,
          notes: parsed.data.notes ?? null,
        },
        include: { flock: true },
      });
    });

    await logAudit({
      entity: "MortalityLog",
      entityId: log.id,
      action: "UPDATE",
      summary: `Updated loss record for flock "${log.flock.name}" (${log.quantity} bird(s))`,
      userId: user.id,
    });

    revalidatePath("/mortality");
    revalidatePath(`/flocks/${existing.flockId}`);
    if (existing.flockId !== log.flockId) revalidatePath(`/flocks/${log.flockId}`);
    revalidatePath("/flocks");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof BusinessError) return error.message;
    throw error;
  }
}
