"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  date: z.string().min(1),
  flockId: z.string().min(1),
  wholeCount: z.coerce.number().int().min(0),
  brokenCount: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export async function createEggLogAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = schema.safeParse({
    date: formData.get("date"),
    flockId: formData.get("flockId"),
    wholeCount: formData.get("wholeCount"),
    brokenCount: formData.get("brokenCount") || 0,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return "Please fill in the required fields correctly.";

  const log = await prisma.eggLog.create({
    data: {
      date: new Date(parsed.data.date),
      flockId: parsed.data.flockId,
      wholeCount: parsed.data.wholeCount,
      brokenCount: parsed.data.brokenCount,
      notes: parsed.data.notes,
      recordedById: user.id,
    },
    include: { flock: true },
  });

  await logAudit({
    entity: "EggLog",
    entityId: log.id,
    action: "CREATE",
    summary: `Logged ${log.wholeCount} eggs (${log.brokenCount} broken) for flock "${log.flock.name}"`,
    userId: user.id,
  });

  revalidatePath("/eggs");
  revalidatePath(`/flocks/${log.flockId}`);
  revalidatePath("/");
}

const updateSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  flockId: z.string().min(1),
  wholeCount: z.coerce.number().int().min(0),
  brokenCount: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export async function updateEggLogAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    date: formData.get("date"),
    flockId: formData.get("flockId"),
    wholeCount: formData.get("wholeCount"),
    brokenCount: formData.get("brokenCount") || 0,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return "Please fill in the required fields correctly.";

  const existing = await prisma.eggLog.findUniqueOrThrow({ where: { id: parsed.data.id } });

  const log = await prisma.eggLog.update({
    where: { id: parsed.data.id },
    data: {
      date: new Date(parsed.data.date),
      flockId: parsed.data.flockId,
      wholeCount: parsed.data.wholeCount,
      brokenCount: parsed.data.brokenCount,
      notes: parsed.data.notes ?? null,
    },
    include: { flock: true },
  });

  await logAudit({
    entity: "EggLog",
    entityId: log.id,
    action: "UPDATE",
    summary: `Updated egg log for flock "${log.flock.name}" (${log.wholeCount} eggs, ${log.brokenCount} broken)`,
    userId: user.id,
  });

  revalidatePath("/eggs");
  revalidatePath(`/flocks/${existing.flockId}`);
  if (existing.flockId !== log.flockId) revalidatePath(`/flocks/${log.flockId}`);
  revalidatePath("/");
}
