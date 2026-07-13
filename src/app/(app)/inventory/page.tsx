import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { CreateItemForm } from "./create-item-form";

export default async function InventoryPage() {
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });
  const lowStock = items.filter((i) => i.currentStock <= i.reorderLevel);
  const { t } = await getDictionary();

  return (
    <div>
      <PageHeader
        title={t.inventory.title}
        description={t.inventory.description}
        action={
          <div className="flex gap-2">
            <LinkButton href="/inventory/purchases" variant="secondary">
              {t.inventory.purchases}
            </LinkButton>
            <LinkButton href="/inventory/usage" variant="secondary">
              {t.inventory.usage}
            </LinkButton>
          </div>
        }
      />

      {lowStock.length > 0 && (
        <Card className="mb-6 border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            {t.inventory.lowStock}: {lowStock.map((i) => i.name).join(", ")}
          </p>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {t.inventory.addItem}
        </h2>
        <CreateItemForm />
      </Card>

      {items.length === 0 ? (
        <EmptyState>{t.inventory.emptyState}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.inventory.item}</Th>
            <Th>{t.inventory.type}</Th>
            <Th>{t.inventory.currentStock}</Th>
            <Th>{t.inventory.alertLevel}</Th>
            <Th>{t.common.status}</Th>
          </THead>
          <TBody>
            {items.map((item) => (
              <tr key={item.id}>
                <Td className="font-medium text-stone-900 dark:text-stone-100">
                  <Link href={`/inventory/${item.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    {item.name}
                  </Link>
                </Td>
                <Td>{t.inventory.types[item.type]}</Td>
                <Td>
                  {item.currentStock} {item.unit}
                </Td>
                <Td>
                  {item.reorderLevel} {item.unit}
                </Td>
                <Td>
                  {item.currentStock <= item.reorderLevel ? (
                    <Badge tone="amber">{t.inventory.lowStock}</Badge>
                  ) : (
                    <Badge tone="green">{t.inventory.ok}</Badge>
                  )}
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
