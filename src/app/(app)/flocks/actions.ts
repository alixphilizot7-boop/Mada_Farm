"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().min(1),
  breed: z.string().optional(),
  startDate: z.string().min(1),
  initialCount: z.coerce.number().int().positive(),
  notes: z.string().optional(),
});

export async function createFlockAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    breed: formData.get("breed") || undefined,
    startDate: formData.get("startDate"),
    initialCount: formData.get("initialCount"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return "Please fill in the required fields correctly.";

  const flock = await prisma.flock.create({
    data: {
      name: parsed.data.name,
      breed: parsed.data.breed,
      startDate: new Date(parsed.data.startDate),
      initialCount: parsed.data.initialCount,
      currentCount: parsed.data.initialCount,
      notes: parsed.data.notes,
    },
  });

  await logAudit({
    entity: "Flock",
    entityId: flock.id,
    action: "CREATE",
    summary: `Created flock "${flock.name}" (${flock.initialCount} birds)`,
    userId: user.id,
  });

  revalidatePath("/flocks");
  redirect(`/flocks/${flock.id}`);
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  breed: z.string().optional(),
  status: z.enum(["ACTIVE", "SOLD_OUT", "CLOSED"]),
  notes: z.string().optional(),
});

export async function updateFlockAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    breed: formData.get("breed") || undefined,
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return "Please fill in the required fields correctly.";

  const flock = await prisma.flock.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      breed: parsed.data.breed ?? null,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
    },
  });

  await logAudit({
    entity: "Flock",
    entityId: flock.id,
    action: "UPDATE",
    summary: `Updated flock "${flock.name}"`,
    userId: user.id,
  });

  revalidatePath("/flocks");
  revalidatePath(`/flocks/${flock.id}`);
  return undefined;
}
