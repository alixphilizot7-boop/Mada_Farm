"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  farmStartDate: z.string().min(1),
});

export async function updateFarmSettingsAction(_prevState: string | undefined, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = schema.safeParse({ farmStartDate: formData.get("farmStartDate") });
  if (!parsed.success) return "Please choose a valid date.";

  await prisma.farmSettings.upsert({
    where: { id: "singleton" },
    update: { farmStartDate: new Date(parsed.data.farmStartDate) },
    create: { id: "singleton", farmStartDate: new Date(parsed.data.farmStartDate) },
  });

  await logAudit({
    entity: "FarmSettings",
    entityId: "singleton",
    action: "UPDATE",
    summary: `Updated farm start date to ${parsed.data.farmStartDate}`,
    userId: admin.id,
  });

  revalidatePath("/settings");
  revalidatePath("/business-plan");
  revalidatePath("/");
}
