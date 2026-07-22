"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { getDictionary } from "@/lib/i18n/locale";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export async function createCustomerAction(_prevState: string | undefined, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = schema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  const customer = await prisma.customer.create({
    data: { ...parsed.data, email: parsed.data.email || undefined },
  });

  await logAudit({
    entity: "Customer",
    entityId: customer.id,
    action: "CREATE",
    summary: `Added customer "${customer.name}"`,
    userId: admin.id,
  });

  revalidatePath("/customers");
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateCustomerAction(_prevState: string | undefined, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const { t } = await getDictionary();
  if (!parsed.success) return t.common.invalidForm;

  const customer = await prisma.customer.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email || null,
      address: parsed.data.address ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  await logAudit({
    entity: "Customer",
    entityId: customer.id,
    action: "UPDATE",
    summary: `Updated customer "${customer.name}"`,
    userId: admin.id,
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${customer.id}`);
}
