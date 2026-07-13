"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, EmptyState, Table, TBody, Td, Th, THead } from "@/components/ui";
import { SearchInput } from "@/components/search-input";
import { formatDate, formatMoney } from "@/lib/format";
import type { Invoice, Customer, InvoiceStatus } from "@prisma/client";

const STATUS_TONE: Record<InvoiceStatus, "zinc" | "blue" | "green" | "amber" | "red"> = {
  DRAFT: "zinc",
  SENT: "blue",
  PAID: "green",
  OVERDUE: "amber",
  CANCELLED: "red",
};

type InvoiceRow = Invoice & { customer: Customer };

export function InvoicesTable({ invoices }: { invoices: InvoiceRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customer.name.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q)
    );
  }, [invoices, query]);

  return (
    <div>
      <div className="mb-4 max-w-xs">
        <SearchInput value={query} onChange={setQuery} placeholder="Search invoice # or customer..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState>
          {invoices.length === 0 ? "No invoices yet. Create your first one." : "No invoices match your search."}
        </EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Invoice #</Th>
            <Th>Customer</Th>
            <Th>Issue date</Th>
            <Th>Total</Th>
            <Th>Status</Th>
          </THead>
          <TBody>
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <Td>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    {inv.invoiceNumber}
                  </Link>
                </Td>
                <Td>{inv.customer.name}</Td>
                <Td className="whitespace-nowrap">{formatDate(inv.issueDate)}</Td>
                <Td>{formatMoney(inv.total)}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[inv.status]}>{inv.status}</Badge>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
