import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError } from "@/lib/require-user";

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) return new Response("Unauthorized", { status: 403 });
    throw error;
  }

  const [
    users,
    flocks,
    eggLogs,
    chickHatches,
    inventoryItems,
    purchases,
    usages,
    healthRecords,
    mortalityLogs,
    customers,
    invoices,
    invoiceItems,
    cashTransactions,
    capexItems,
    auditLogs,
    farmSettings,
    planYears,
    dailyLogs,
    taskGroups,
    tasks,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.flock.findMany(),
    prisma.eggLog.findMany(),
    prisma.chickHatch.findMany(),
    prisma.inventoryItem.findMany(),
    prisma.purchase.findMany(),
    prisma.usage.findMany(),
    prisma.healthRecord.findMany(),
    prisma.mortalityLog.findMany(),
    prisma.customer.findMany(),
    prisma.invoice.findMany(),
    prisma.invoiceItem.findMany(),
    prisma.cashTransaction.findMany(),
    prisma.capexItem.findMany(),
    prisma.auditLog.findMany(),
    prisma.farmSettings.findMany(),
    prisma.planYear.findMany(),
    prisma.dailyLog.findMany(),
    prisma.taskGroup.findMany(),
    prisma.task.findMany(),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    users,
    flocks,
    eggLogs,
    chickHatches,
    inventoryItems,
    purchases,
    usages,
    healthRecords,
    mortalityLogs,
    customers,
    invoices,
    invoiceItems,
    cashTransactions,
    capexItems,
    auditLogs,
    farmSettings,
    planYears,
    dailyLogs,
    taskGroups,
    tasks,
  };

  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mada-farm-backup-${stamp}.json"`,
    },
  });
}
