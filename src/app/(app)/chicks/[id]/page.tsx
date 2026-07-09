import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
import { EditChickHatchForm } from "./edit-chick-hatch-form";

export default async function EditChickHatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [hatch, flocks] = await Promise.all([
    prisma.chickHatch.findUnique({ where: { id } }),
    prisma.flock.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!hatch) notFound();

  return (
    <div>
      <PageHeader title="Edit Hatch Record" />
      <Card>
        <EditChickHatchForm hatch={hatch} flocks={flocks} />
      </Card>
    </div>
  );
}
