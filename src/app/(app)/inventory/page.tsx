import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { CreateItemForm } from "./create-item-form";

export default async function InventoryPage() {
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });
  const lowStock = items.filter((i) => i.currentStock <= i.reorderLevel);

  return (
    <div>
      <PageHeader
        title="Feed & Water"
        description="Inventory of feed, water and other supplies for the flocks."
        action={
          <div className="flex gap-2">
            <LinkButton href="/inventory/purchases" variant="secondary">
              Purchases
            </LinkButton>
            <LinkButton href="/inventory/usage" variant="secondary">
              Usage
            </LinkButton>
          </div>
        }
      />

      {lowStock.length > 0 && (
        <Card className="mb-6 border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Low stock: {lowStock.map((i) => i.name).join(", ")}
          </p>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Add inventory item
        </h2>
        <CreateItemForm />
      </Card>

      {items.length === 0 ? (
        <EmptyState>No inventory items yet. Add feed, water, or other supplies above.</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Item</Th>
            <Th>Type</Th>
            <Th>Current stock</Th>
            <Th>Alert level</Th>
            <Th>Status</Th>
          </THead>
          <TBody>
            {items.map((item) => (
              <tr key={item.id}>
                <Td className="font-medium text-zinc-900 dark:text-zinc-100">
                  <Link href={`/inventory/${item.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    {item.name}
                  </Link>
                </Td>
                <Td>{item.type}</Td>
                <Td>
                  {item.currentStock} {item.unit}
                </Td>
                <Td>
                  {item.reorderLevel} {item.unit}
                </Td>
                <Td>
                  {item.currentStock <= item.reorderLevel ? (
                    <Badge tone="amber">Low stock</Badge>
                  ) : (
                    <Badge tone="green">OK</Badge>
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
