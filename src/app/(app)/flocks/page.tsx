import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { CreateFlockForm } from "./create-flock-form";

const STATUS_TONE = {
  ACTIVE: "green",
  SOLD_OUT: "amber",
  CLOSED: "zinc",
} as const;

export default async function FlocksPage() {
  const flocks = await prisma.flock.findMany({ orderBy: { startDate: "desc" } });

  return (
    <div>
      <PageHeader title="Flocks" description="Every batch of chickens on the farm, tracked from day one." />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Register a new flock
        </h2>
        <CreateFlockForm />
      </Card>

      {flocks.length === 0 ? (
        <EmptyState>No flocks yet. Register your first batch above.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Name</Th>
            <Th>Breed</Th>
            <Th>Start date</Th>
            <Th>Initial</Th>
            <Th>Current</Th>
            <Th>Status</Th>
          </THead>
          <TBody>
            {flocks.map((flock) => (
              <tr key={flock.id}>
                <Td>
                  <Link href={`/flocks/${flock.id}`} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                    {flock.name}
                  </Link>
                </Td>
                <Td>{flock.breed ?? "—"}</Td>
                <Td>{formatDate(flock.startDate)}</Td>
                <Td>{flock.initialCount}</Td>
                <Td>{flock.currentCount}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[flock.status]}>{flock.status.replace("_", " ")}</Badge>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
