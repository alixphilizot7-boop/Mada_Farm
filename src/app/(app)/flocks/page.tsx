import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
import { CreateFlockForm } from "./create-flock-form";

export default async function FlocksPage() {
  const flocks = await prisma.flock.findMany({ orderBy: { startDate: "desc" } });
  const { t } = await getDictionary();

  const STATUS_TONE = {
    ACTIVE: "green",
    SOLD_OUT: "amber",
    CLOSED: "zinc",
  } as const;

  const STATUS_LABEL = {
    ACTIVE: t.flocks.statusActive,
    SOLD_OUT: t.flocks.statusSoldOut,
    CLOSED: t.flocks.statusClosed,
  } as const;

  return (
    <div>
      <PageHeader title={t.flocks.title} description={t.flocks.description} />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {t.flocks.registerNew}
        </h2>
        <CreateFlockForm />
      </Card>

      {flocks.length === 0 ? (
        <EmptyState>{t.flocks.emptyState}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.flocks.name}</Th>
            <Th>{t.flocks.breed}</Th>
            <Th>{t.flocks.startDate}</Th>
            <Th>{t.flocks.initial}</Th>
            <Th>{t.flocks.current}</Th>
            <Th>{t.common.status}</Th>
          </THead>
          <TBody>
            {flocks.map((flock) => (
              <tr key={flock.id}>
                <Td>
                  <Link href={`/flocks/${flock.id}`} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                    {flock.name}
                  </Link>
                </Td>
                <Td>{flock.breed ?? t.common.none}</Td>
                <Td>{formatDate(flock.startDate)}</Td>
                <Td>{flock.initialCount}</Td>
                <Td>{flock.currentCount}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[flock.status]}>{STATUS_LABEL[flock.status]}</Badge>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
