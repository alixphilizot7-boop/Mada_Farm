"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { getDictionary } from "@/lib/i18n/locale";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "STAFF", "EMPLOYEE"]),
});

export async function createUserAction(_prevState: string | undefined, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.users.errorInvalidCreate;

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return t.users.errorDuplicateEmail;

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
    },
  });

  await logAudit({
    entity: "User",
    entityId: user.id,
    action: "CREATE",
    summary: `Created user ${user.email} (${user.role})`,
    userId: admin.id,
  });

  revalidatePath("/users");
}

export async function toggleUserActiveAction(userId: string) {
  const admin = await requireAdmin();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const { t } = await getDictionary();

  if (user.id === admin.id) throw new Error(t.users.errorCannotDeactivateSelf);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { active: !user.active },
  });

  await logAudit({
    entity: "User",
    entityId: user.id,
    action: "UPDATE",
    summary: `${updated.active ? "Activated" : "Deactivated"} user ${user.email}`,
    userId: admin.id,
  });

  revalidatePath("/users");
}

const updateUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["ADMIN", "STAFF", "EMPLOYEE"]),
});

export async function updateUserAction(_prevState: string | undefined, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = updateUserSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.users.errorInvalidUpdate;

  if (parsed.data.userId === admin.id && parsed.data.role !== "ADMIN") {
    return t.users.errorCannotRemoveOwnAdmin;
  }

  const duplicate = await prisma.user.findFirst({
    where: { email: parsed.data.email, NOT: { id: parsed.data.userId } },
  });
  if (duplicate) return t.users.errorDuplicateEmail;

  const user = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { name: parsed.data.name, email: parsed.data.email, role: parsed.data.role },
  });

  await logAudit({
    entity: "User",
    entityId: user.id,
    action: "UPDATE",
    summary: `Updated user ${user.email} (${user.role})`,
    userId: admin.id,
  });

  revalidatePath("/users");
}

const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(6),
});

export async function resetPasswordAction(_prevState: string | undefined, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = resetPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.users.errorPasswordMinLength;

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash },
  });

  await logAudit({
    entity: "User",
    entityId: user.id,
    action: "UPDATE",
    summary: `Reset password for user ${user.email}`,
    userId: admin.id,
  });

  revalidatePath("/users");
  return undefined;
}
