"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, EmptyState, Table, TBody, Td, Th, THead } from "@/components/ui";
import { SearchInput } from "@/components/search-input";
import { formatDate, formatMoney } from "@/lib/format";

export type CashFlowRow = {
  id: string;
  date: Date;
  type: "INCOME" | "EXPENSE";
  category: string;
  details: string;
  amount: number;
  balance: number;
};

export function CashFlowTable({ rows }: { rows: CashFlowRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.category.toLowerCase().includes(q) || r.details.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div>
      <div className="mb-4 max-w-xs">
        <SearchInput value={query} onChange={setQuery} placeholder="Search category or details..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState>{rows.length === 0 ? "No cash flow activity yet." : "No entries match your search."}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Category</Th>
            <Th>Details</Th>
            <Th>Amount</Th>
            <Th>Balance</Th>
            <Th></Th>
          </THead>
          <TBody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <Td className="whitespace-nowrap">{formatDate(t.date)}</Td>
                <Td>
                  <Badge tone={t.type === "INCOME" ? "green" : "red"}>{t.type}</Badge>
                </Td>
                <Td>{t.category}</Td>
                <Td>{t.details}</Td>
                <Td className={t.type === "INCOME" ? "text-emerald-600" : "text-red-600"}>
                  {t.type === "INCOME" ? "+" : "-"}
                  {formatMoney(t.amount)}
                </Td>
                <Td className="font-medium">{formatMoney(t.balance)}</Td>
                <Td>
                  <Link href={`/cashflow/${t.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    Edit
                  </Link>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
