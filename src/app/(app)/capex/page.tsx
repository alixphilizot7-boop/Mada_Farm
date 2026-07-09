import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { CreateItemForm } from "./create-item-form";
import { RecordPurchaseForm } from "./record-purchase-form";
import { MarkOrderedButton, UndoPurchaseButton } from "./status-buttons";

const STATUS_TONE = {
  PLANNED: "zinc",
  ORDERED: "blue",
  PURCHASED: "green",
} as const;

export default async function CapexPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const items = await prisma.capexItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const totalPlanned = items.reduce((s, i) => s + (i.plannedTotal ?? 0), 0);
  const totalSpent = items
    .filter((i) => i.status === "PURCHASED")
    .reduce((s, i) => s + (i.actualTotal ?? 0), 0);
  const purchasedCount = items.filter((i) => i.status === "PURCHASED").length;

  return (
    <div>
      <PageHeader
        title="Construction & Equipment"
        description="Farm construction materials and equipment — budgeted vs. actually bought."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Planned budget</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{formatMoney(totalPlanned)}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Actually spent</p>
          <p className="text-xl font-semibold text-emerald-600">{formatMoney(totalSpent)}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">Items purchased</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {purchasedCount} / {items.length}
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          Add a budget item
        </h2>
        <CreateItemForm />
      </Card>

      {items.length === 0 ? (
        <EmptyState>No construction or equipment items yet. Add one above.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Category</Th>
            <Th>Item</Th>
            <Th>Planned</Th>
            <Th>Status</Th>
            <Th>Actual</Th>
            <Th>Supplier</Th>
            <Th></Th>
          </THead>
          <TBody>
            {items.map((item) => (
              <tr key={item.id}>
                <Td className="whitespace-nowrap">{item.category}</Td>
                <Td>
                  <Link href={`/capex/${item.id}`} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                    {item.name}
                  </Link>
                  {item.link && (
                    <>
                      {" · "}
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-stone-400 hover:underline">
                        link
                      </a>
                    </>
                  )}
                </Td>
                <Td>
                  {item.plannedQuantity != null && item.plannedUnitCost != null
                    ? `${item.plannedQuantity} × ${formatMoney(item.plannedUnitCost)} = ${formatMoney(item.plannedTotal ?? 0)}`
                    : "—"}
                </Td>
                <Td>
                  <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
                </Td>
                <Td>{item.status === "PURCHASED" ? formatMoney(item.actualTotal ?? 0) : "—"}</Td>
                <Td>{item.supplier ?? "—"}</Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.status === "PLANNED" && <MarkOrderedButton id={item.id} />}
                    {item.status !== "PURCHASED" && <RecordPurchaseForm item={item} />}
                    {item.status === "PURCHASED" && <UndoPurchaseButton id={item.id} />}
                  </div>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
