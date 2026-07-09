"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { BusinessError } from "@/lib/errors";
import { syncMortalityForHealthRecord } from "@/lib/health-mortality-sync";

const schema = z.object({
  date: z.string().min(1),
  flockId: z.string().min(1),
  type: z.enum(["ILLNESS", "VACCINATION", "TREATMENT", "CHECKUP"]),
  vaccinationType: z.string().optional(),
  affectedCount: z.coerce.number().int().min(0).default(0),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  medicineUsed: z.string().optional(),
  cost: z.coerce.number().min(0).default(0),
  outcome: z.enum(["RECOVERED", "ONGOING", "DECEASED"]),
  notes: z.string().optional(),
});

function parseHealthForm(formData: FormData) {
  return schema.safeParse({
    date: formData.get("date"),
    flockId: formData.get("flockId"),
    type: formData.get("type"),
    vaccinationType: formData.get("vaccinationType") || undefined,
    affectedCount: formData.get("affectedCount") || 0,
    diagnosis: formData.get("diagnosis") || undefined,
    treatment: formData.get("treatment") || undefined,
    medicineUsed: formData.get("medicineUsed") || undefined,
    cost: formData.get("cost") || 0,
    outcome: formData.get("outcome"),
    notes: formData.get("notes") || undefined,
  });
}

export async function createHealthRecordAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();

  const parsed = parseHealthForm(formData);
  if (!parsed.success) return "Please fill in the required fields correctly.";

  const date = new Date(parsed.data.date);

  try {
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.healthRecord.create({
        data: { ...parsed.data, date, recordedById: user.id },
        include: { flock: true },
      });

      if (parsed.data.cost > 0) {
        await tx.cashTransaction.create({
          data: {
            date,
            type: "EXPENSE",
            category: "Health & veterinary",
            amount: parsed.data.cost,
            description: `${created.type} for flock "${created.flock.name}"${created.diagnosis ? `: ${created.diagnosis}` : ""}`,
            healthRecordId: created.id,
            recordedById: user.id,
          },
        });
      }

      await syncMortalityForHealthRecord(tx, {
        healthRecordId: created.id,
        flockId: created.flockId,
        date,
        outcome: created.outcome,
        affectedCount: created.affectedCount,
        diagnosis: created.diagnosis,
        type: created.type,
        recordedById: user.id,
      });

      return created;
    });

    await logAudit({
      entity: "HealthRecord",
      entityId: record.id,
      action: "CREATE",
      summary: `Logged ${record.type.toLowerCase()} for flock "${record.flock.name}" (${record.outcome.toLowerCase()})`,
      userId: user.id,
    });

    revalidatePath("/health");
    revalidatePath("/mortality");
    revalidatePath(`/flocks/${record.flockId}`);
    revalidatePath("/flocks");
    revalidatePath("/cashflow");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof BusinessError) return error.message;
    throw error;
  }
}

export async function updateHealthRecordAction(_prevState: string | undefined, formData: FormData) {
  const user = await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return "Missing record id.";

  const parsed = parseHealthForm(formData);
  if (!parsed.success) return "Please fill in the required fields correctly.";

  const date = new Date(parsed.data.date);

  try {
    const record = await prisma.$transaction(async (tx) => {
      const existing = await tx.healthRecord.findUniqueOrThrow({ where: { id }, include: { cashTxn: true } });

      const updated = await tx.healthRecord.update({
        where: { id },
        data: {
          ...parsed.data,
          date,
          vaccinationType: parsed.data.vaccinationType ?? null,
          diagnosis: parsed.data.diagnosis ?? null,
          treatment: parsed.data.treatment ?? null,
          medicineUsed: parsed.data.medicineUsed ?? null,
          notes: parsed.data.notes ?? null,
        },
        include: { flock: true },
      });

      if (parsed.data.cost > 0) {
        const description = `${updated.type} for flock "${updated.flock.name}"${updated.diagnosis ? `: ${updated.diagnosis}` : ""}`;
        if (existing.cashTxn) {
          await tx.cashTransaction.update({
            where: { id: existing.cashTxn.id },
            data: { date, amount: parsed.data.cost, description },
          });
        } else {
          await tx.cashTransaction.create({
            data: {
              date,
              type: "EXPENSE",
              category: "Health & veterinary",
              amount: parsed.data.cost,
              description,
              healthRecordId: updated.id,
              recordedById: user.id,
            },
          });
        }
      } else if (existing.cashTxn) {
        await tx.cashTransaction.delete({ where: { id: existing.cashTxn.id } });
      }

      await syncMortalityForHealthRecord(tx, {
        healthRecordId: updated.id,
        flockId: updated.flockId,
        date,
        outcome: updated.outcome,
        affectedCount: updated.affectedCount,
        diagnosis: updated.diagnosis,
        type: updated.type,
        recordedById: user.id,
      });

      return { existing, updated };
    });

    await logAudit({
      entity: "HealthRecord",
      entityId: record.updated.id,
      action: "UPDATE",
      summary: `Updated ${record.updated.type.toLowerCase()} record for flock "${record.updated.flock.name}"`,
      userId: user.id,
    });

    revalidatePath("/health");
    revalidatePath("/mortality");
    revalidatePath(`/flocks/${record.existing.flockId}`);
    if (record.existing.flockId !== record.updated.flockId) revalidatePath(`/flocks/${record.updated.flockId}`);
    revalidatePath("/flocks");
    revalidatePath("/cashflow");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof BusinessError) return error.message;
    throw error;
  }
}
