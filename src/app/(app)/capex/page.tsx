import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { getFarmSettings } from "@/lib/farm-settings";
import { getDictionary } from "@/lib/i18n/locale";
import { CreateItemForm } from "./create-item-form";
import { RecordPurchaseForm } from "./record-purchase-form";
import { MarkOrderedButton, UndoPurchaseButton } from "./status-buttons";

const STATUS_TONE = {
  PLANNED: "zinc",
  ORDERED: "blue",
  PURCHASED: "green",
  DEFERRED: "amber",
} as const;

function formatMga(amountEur: number, mgaPerEur: number) {
  const mga = amountEur * mgaPerEur;
  return `${Math.round(mga).toLocaleString("fr-FR")} Ar`;
}

export default async function CapexPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();

  const [items, settings] = await Promise.all([
    prisma.capexItem.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    getFarmSettings(),
  ]);
  const mgaPerEur = settings.mgaPerEur;

  const startupItems = items.filter((i) => i.status !== "DEFERRED");
  const totalPlanned = startupItems.reduce((s, i) => s + (i.plannedTotal ?? 0), 0);
  const totalSpent = items.filter((i) => i.status === "PURCHASED").reduce((s, i) => s + (i.actualTotal ?? 0), 0);
  const purchasedCount = items.filter((i) => i.status === "PURCHASED").length;
  const variance = totalSpent - startupItems.filter((i) => i.status === "PURCHASED").reduce((s, i) => s + (i.plannedTotal ?? 0), 0);
  const variancePct =
    startupItems.filter((i) => i.status === "PURCHASED").reduce((s, i) => s + (i.plannedTotal ?? 0), 0) > 0
      ? (variance / startupItems.filter((i) => i.status === "PURCHASED").reduce((s, i) => s + (i.plannedTotal ?? 0), 0)) * 100
      : 0;

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div>
      <PageHeader
        title={t.capex.title}
        description={t.capex.description}
        action={<LinkButton href="/api/capex/csv" variant="secondary">{t.capex.exportCsv}</LinkButton>}
      />

      <Card className="mb-6 border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm text-amber-800 dark:text-amber-300">{t.capex.priceNote}</p>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{t.capex.startupTotal}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{formatMoney(totalPlanned)}</p>
          <p className="text-xs text-stone-400">{formatMga(totalPlanned, mgaPerEur)}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{t.capex.actuallySpent}</p>
          <p className="text-xl font-semibold text-emerald-600">{formatMoney(totalSpent)}</p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{t.capex.itemsPurchased}</p>
          <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            {purchasedCount} / {items.length}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500 dark:text-stone-400">{t.capex.variance}</p>
          <p className={`text-xl font-semibold ${variance > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {variance > 0 ? "+" : ""}
            {formatMoney(variance)} {purchasedCount > 0 && `(${variancePct > 0 ? "+" : ""}${variancePct.toFixed(1)}%)`}
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">{t.capex.addBudgetItem}</h2>
        <CreateItemForm />
      </Card>

      {items.length === 0 ? (
        <EmptyState>{t.capex.emptyState}</EmptyState>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryItems = items.filter((i) => i.category === category);
            const categoryTotal = categoryItems
              .filter((i) => i.status !== "DEFERRED")
              .reduce((s, i) => s + (i.plannedTotal ?? 0), 0);

            return (
              <Card key={category}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-heading text-lg font-semibold text-stone-900 dark:text-stone-50">{category}</h3>
                  <span className="text-sm text-stone-500 dark:text-stone-400">
                    {t.capex.categoryTotal}: {formatMoney(categoryTotal)} · {formatMga(categoryTotal, mgaPerEur)}
                  </span>
                </div>
                <Table>
                  <THead>
                    <Th>{t.capex.item}</Th>
                    <Th>{t.capex.qty}</Th>
                    <Th>{t.capex.unitCost}</Th>
                    <Th>{t.capex.totalEur}</Th>
                    <Th>{t.capex.totalMga}</Th>
                    <Th>{t.common.status}</Th>
                    <Th>{t.capex.actuallyPaid}</Th>
                    <Th>{t.common.notes}</Th>
                    <Th></Th>
                  </THead>
                  <TBody>
                    {categoryItems.map((item) => (
                      <tr key={item.id}>
                        <Td>
                          <Link href={`/capex/${item.id}`} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                            {item.name}
                          </Link>
                          {item.link && (
                            <>
                              {" · "}
                              <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-stone-400 hover:underline">
                                {t.capex.link}
                              </a>
                            </>
                          )}
                        </Td>
                        <Td>{item.plannedQuantity ?? t.common.none}</Td>
                        <Td>{item.plannedUnitCost != null ? formatMoney(item.plannedUnitCost) : t.common.none}</Td>
                        <Td>{item.plannedTotal != null ? formatMoney(item.plannedTotal) : t.common.none}</Td>
                        <Td>{item.plannedTotal != null ? formatMga(item.plannedTotal, mgaPerEur) : t.common.none}</Td>
                        <Td>
                          <Badge tone={STATUS_TONE[item.status]}>{t.capexStatus[item.status]}</Badge>
                        </Td>
                        <Td>{item.status === "PURCHASED" ? formatMoney(item.actualTotal ?? 0) : t.common.none}</Td>
                        <Td className="max-w-40 truncate">{item.notes ?? t.common.none}</Td>
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
