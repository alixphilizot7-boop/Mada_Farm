import { prisma } from "@/lib/prisma";
import type { AuditAction } from "@prisma/client";

export async function logAudit(params: {
  entity: string;
  entityId: string;
  action: AuditAction;
  summary: string;
  userId: string;
}) {
  await prisma.auditLog.create({ data: params });
}
