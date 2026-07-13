import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { EditChickHatchForm } from "./edit-chick-hatch-form";

export default async function EditChickHatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getDictionary();

  const [hatch, flocks] = await Promise.all([
    prisma.chickHatch.findUnique({ where: { id } }),
    prisma.flock.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!hatch) notFound();

  return (
    <div>
      <PageHeader title={t.chicks.editTitle} />
      <Card>
        <EditChickHatchForm hatch={hatch} flocks={flocks} />
      </Card>
    </div>
  );
}
