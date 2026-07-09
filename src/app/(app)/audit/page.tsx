import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

const ACTION_TONE = {
  CREATE: "green",
  UPDATE: "blue",
  DELETE: "red",
} as const;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const { entity } = await searchParams;

  const [logs, entities] = await Promise.all([
    prisma.auditLog.findMany({
      where: entity ? { entity } : undefined,
      orderBy: { createdAt: "desc" },
      take: 300,
      include: { user: true },
    }),
    prisma.auditLog.findMany({ distinct: ["entity"], select: { entity: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Every create, update and delete across the farm — who did what, and when."
      />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-2">
          <a
            href="/audit"
            className={`rounded-full px-3 py-1 text-xs font-medium ${!entity ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}
          >
            All
          </a>
          {entities.map((e) => (
            <a
              key={e.entity}
              href={`/audit?entity=${e.entity}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${entity === e.entity ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}
            >
              {e.entity}
            </a>
          ))}
        </div>
      </Card>

      {logs.length === 0 ? (
        <EmptyState>No activity recorded yet.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>When</Th>
            <Th>Entity</Th>
            <Th>Action</Th>
            <Th>Summary</Th>
            <Th>By</Th>
          </THead>
          <TBody>
            {logs.map((log) => (
              <tr key={log.id}>
                <Td className="whitespace-nowrap">{formatDateTime(log.createdAt)}</Td>
                <Td>{log.entity}</Td>
                <Td>
                  <Badge tone={ACTION_TONE[log.action]}>{log.action}</Badge>
                </Td>
                <Td>{log.summary}</Td>
                <Td>{log.user.name}</Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
