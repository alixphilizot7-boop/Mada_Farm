"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { getDictionary } from "@/lib/i18n/locale";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function changePasswordAction(_prevState: string | undefined, formData: FormData) {
  const sessionUser = await requireUser();

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.account.errorPasswordMinLength;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return t.account.errorCurrentIncorrect;

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  await logAudit({
    entity: "User",
    entityId: user.id,
    action: "UPDATE",
    summary: `${user.email} changed their own password`,
    userId: user.id,
  });

  return t.account.passwordUpdated;
}
