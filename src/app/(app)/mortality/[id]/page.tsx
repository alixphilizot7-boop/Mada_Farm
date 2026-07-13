import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { EditMortalityForm } from "./edit-mortality-form";

export default async function EditMortalityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getDictionary();

  const [log, flocks] = await Promise.all([
    prisma.mortalityLog.findUnique({ where: { id } }),
    prisma.flock.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!log) notFound();

  return (
    <div>
      <PageHeader title={t.mortality.editTitle} />
      <Card>
        {log.healthRecordId ? (
          <p className="text-sm text-stone-600 dark:text-stone-300">
            {t.mortality.autoLoggedFrom}{" "}
            <Link href={`/health/${log.healthRecordId}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
              {t.mortality.editHealthInstead}
            </Link>
            .
          </p>
        ) : (
          <EditMortalityForm log={log} flocks={flocks} />
        )}
      </Card>
    </div>
  );
}
