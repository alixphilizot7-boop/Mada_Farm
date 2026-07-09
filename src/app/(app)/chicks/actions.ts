"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { BusinessError } from "@/lib/errors";

const schema = z.object({
  date: z.string().min(1),
  eggsSet: z.coerce.number().int().positive(),
  chicksHatched: z.coerce.number().int().min(0),
  flockId: z.string().optional(),
  notes: z.string().optional(),
});

export async function createChickHatchAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = schema.safeParse({
    date: formData.get("date"),
    eggsSet: formData.get("eggsSet"),
    chicksHatched: formData.get("chicksHatched"),
    flockId: formData.get("flockId") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return "Please fill in the required fields correctly.";
  if (parsed.data.chicksHatched > parsed.data.eggsSet) {
    return "Chicks hatched can't exceed eggs set.";
  }

  const hatch = await prisma.$transaction(async (tx) => {
    if (parsed.data.flockId && parsed.data.chicksHatched > 0) {
      await tx.flock.update({
        where: { id: parsed.data.flockId },
        data: { currentCount: { increment: parsed.data.chicksHatched } },
      });
    }

    return tx.chickHatch.create({
      data: {
        date: new Date(parsed.data.date),
        eggsSet: parsed.data.eggsSet,
        chicksHatched: parsed.data.chicksHatched,
        flockId: parsed.data.flockId,
        notes: parsed.data.notes,
        recordedById: user.id,
      },
      include: { flock: true },
    });
  });

  await logAudit({
    entity: "ChickHatch",
    entityId: hatch.id,
    action: "CREATE",
    summary: `Hatched ${hatch.chicksHatched} chicks from ${hatch.eggsSet} eggs${hatch.flock ? ` into flock "${hatch.flock.name}"` : ""}`,
    userId: user.id,
  });

  revalidatePath("/chicks");
  revalidatePath("/");
  if (hatch.flockId) {
    revalidatePath(`/flocks/${hatch.flockId}`);
    revalidatePath("/flocks");
  }
}

const updateSchema = schema.extend({ id: z.string().min(1) });

export async function updateChickHatchAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    date: formData.get("date"),
    eggsSet: formData.get("eggsSet"),
    chicksHatched: formData.get("chicksHatched"),
    flockId: formData.get("flockId") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return "Please fill in the required fields correctly.";
  if (parsed.data.chicksHatched > parsed.data.eggsSet) {
    return "Chicks hatched can't exceed eggs set.";
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.chickHatch.findUniqueOrThrow({ where: { id: parsed.data.id } });

      if (existing.flockId === parsed.data.flockId) {
        const delta = parsed.data.chicksHatched - existing.chicksHatched;
        if (delta !== 0 && parsed.data.flockId) {
          if (delta < 0) {
            const flock = await tx.flock.findUniqueOrThrow({ where: { id: parsed.data.flockId } });
            if (-delta > flock.currentCount) {
              throw new BusinessError(`Can't reduce this hatch — only ${flock.currentCount} birds remain in the flock.`);
            }
          }
          await tx.flock.update({ where: { id: parsed.data.flockId }, data: { currentCount: { increment: delta } } });
        }
      } else {
        if (existing.flockId && existing.chicksHatched > 0) {
          const oldFlock = await tx.flock.findUniqueOrThrow({ where: { id: existing.flockId } });
          if (existing.chicksHatched > oldFlock.currentCount) {
            throw new BusinessError(`Can't move this hatch off its flock — only ${oldFlock.currentCount} birds remain there.`);
          }
          await tx.flock.update({ where: { id: existing.flockId }, data: { currentCount: { decrement: existing.chicksHatched } } });
        }
        if (parsed.data.flockId && parsed.data.chicksHatched > 0) {
          await tx.flock.update({ where: { id: parsed.data.flockId }, data: { currentCount: { increment: parsed.data.chicksHatched } } });
        }
      }

      const updated = await tx.chickHatch.update({
        where: { id: parsed.data.id },
        data: {
          date: new Date(parsed.data.date),
          eggsSet: parsed.data.eggsSet,
          chicksHatched: parsed.data.chicksHatched,
          flockId: parsed.data.flockId ?? null,
          notes: parsed.data.notes ?? null,
        },
        include: { flock: true },
      });

      return { existing, updated };
    });

    await logAudit({
      entity: "ChickHatch",
      entityId: result.updated.id,
      action: "UPDATE",
      summary: `Updated hatch record (${result.updated.chicksHatched} chicks from ${result.updated.eggsSet} eggs)`,
      userId: user.id,
    });

    revalidatePath("/chicks");
    revalidatePath("/");
    if (result.existing.flockId) revalidatePath(`/flocks/${result.existing.flockId}`);
    if (result.updated.flockId && result.updated.flockId !== result.existing.flockId) {
      revalidatePath(`/flocks/${result.updated.flockId}`);
    }
    revalidatePath("/flocks");
  } catch (error) {
    if (error instanceof BusinessError) return error.message;
    throw error;
  }
}
