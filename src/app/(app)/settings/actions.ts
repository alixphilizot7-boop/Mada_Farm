"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { getDictionary } from "@/lib/i18n/locale";

const schema = z.object({
  farmStartDate: z.string().min(1),
  mgaPerEur: z.coerce.number().positive(),
});

export async function updateFarmSettingsAction(_prevState: string | undefined, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = schema.safeParse({
    farmStartDate: formData.get("farmStartDate"),
    mgaPerEur: formData.get("mgaPerEur"),
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  await prisma.farmSettings.upsert({
    where: { id: "singleton" },
    update: { farmStartDate: new Date(parsed.data.farmStartDate), mgaPerEur: parsed.data.mgaPerEur },
    create: { id: "singleton", farmStartDate: new Date(parsed.data.farmStartDate), mgaPerEur: parsed.data.mgaPerEur },
  });

  await logAudit({
    entity: "FarmSettings",
    entityId: "singleton",
    action: "UPDATE",
    summary: `Updated farm start date to ${parsed.data.farmStartDate} and exchange rate to ${parsed.data.mgaPerEur} MGA/€`,
    userId: admin.id,
  });

  revalidatePath("/settings");
  revalidatePath("/business-plan");
  revalidatePath("/capex");
  revalidatePath("/");
}
