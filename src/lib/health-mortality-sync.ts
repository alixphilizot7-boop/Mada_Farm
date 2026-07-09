import type { Prisma, HealthOutcome, HealthRecordType } from "@prisma/client";
import { BusinessError } from "@/lib/errors";

type Tx = Prisma.TransactionClient;

export async function syncMortalityForHealthRecord(
  tx: Tx,
  params: {
    healthRecordId: string;
    flockId: string;
    date: Date;
    outcome: HealthOutcome;
    affectedCount: number;
    diagnosis?: string | null;
    type: HealthRecordType;
    recordedById: string;
  }
) {
  const { healthRecordId, flockId, date, outcome, affectedCount, diagnosis, type, recordedById } = params;

  const existing = await tx.mortalityLog.findUnique({ where: { healthRecordId } });
  const shouldHaveMortality = outcome === "DECEASED" && affectedCount > 0;

  if (shouldHaveMortality) {
    const cause = `${type}${diagnosis ? `: ${diagnosis}` : ""}`;

    if (existing) {
      if (existing.flockId !== flockId) {
        await tx.flock.update({
          where: { id: existing.flockId },
          data: { currentCount: { increment: existing.quantity } },
        });
        const newFlock = await tx.flock.findUniqueOrThrow({ where: { id: flockId } });
        if (affectedCount > newFlock.currentCount) {
          throw new BusinessError(`Only ${newFlock.currentCount} birds remain in this flock.`);
        }
        await tx.flock.update({ where: { id: flockId }, data: { currentCount: { decrement: affectedCount } } });
      } else {
        const delta = affectedCount - existing.quantity;
        if (delta !== 0) {
          const flock = await tx.flock.findUniqueOrThrow({ where: { id: flockId } });
          if (delta > flock.currentCount) {
            throw new BusinessError(`Only ${flock.currentCount} birds remain in this flock.`);
          }
          await tx.flock.update({ where: { id: flockId }, data: { currentCount: { decrement: delta } } });
        }
      }
      await tx.mortalityLog.update({
        where: { id: existing.id },
        data: { date, quantity: affectedCount, cause, flockId },
      });
    } else {
      const flock = await tx.flock.findUniqueOrThrow({ where: { id: flockId } });
      if (affectedCount > flock.currentCount) {
        throw new BusinessError(`Only ${flock.currentCount} birds remain in this flock.`);
      }
      await tx.flock.update({ where: { id: flockId }, data: { currentCount: { decrement: affectedCount } } });
      await tx.mortalityLog.create({
        data: { date, flockId, quantity: affectedCount, cause, healthRecordId, recordedById },
      });
    }
  } else if (existing) {
    await tx.flock.update({
      where: { id: existing.flockId },
      data: { currentCount: { increment: existing.quantity } },
    });
    await tx.mortalityLog.delete({ where: { id: existing.id } });
  }
}
