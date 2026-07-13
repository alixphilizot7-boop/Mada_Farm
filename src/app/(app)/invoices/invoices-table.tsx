"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, EmptyState, Table, TBody, Td, Th, THead } from "@/components/ui";
import { SearchInput } from "@/components/search-input";
import { formatDate, formatMoney } from "@/lib/format";
import { useI18n } from "@/components/i18n-provider";
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
  const { t } = useI18n();

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
        <SearchInput value={query} onChange={setQuery} placeholder={t.invoices.searchPlaceholder} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState>
          {invoices.length === 0 ? t.invoices.emptyState : t.invoices.emptySearch}
        </EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.invoices.invoiceNumber}</Th>
            <Th>{t.invoices.customer}</Th>
            <Th>{t.invoices.issueDate}</Th>
            <Th>{t.common.total}</Th>
            <Th>{t.common.status}</Th>
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
                  <Badge tone={STATUS_TONE[inv.status]}>{t.invoiceStatus[inv.status]}</Badge>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
