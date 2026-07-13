"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, EmptyState, Table, TBody, Td, Th, THead } from "@/components/ui";
import { SearchInput } from "@/components/search-input";
import { formatDate, formatMoney } from "@/lib/format";
import { useI18n } from "@/components/i18n-provider";

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
  const { t } = useI18n();
  const c = t.cashflow;

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
        <SearchInput value={query} onChange={setQuery} placeholder={c.searchPlaceholder} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState>{rows.length === 0 ? c.emptyState : c.emptySearch}</EmptyState>
      ) : (
        <Table>
          <THead>
            <Th>{t.common.date}</Th>
            <Th>{t.cashflow.form.type}</Th>
            <Th>{c.category}</Th>
            <Th>{c.details}</Th>
            <Th>{c.amount}</Th>
            <Th>{c.balance}</Th>
            <Th></Th>
          </THead>
          <TBody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <Td className="whitespace-nowrap">{formatDate(row.date)}</Td>
                <Td>
                  <Badge tone={row.type === "INCOME" ? "green" : "red"}>{t.cashType[row.type]}</Badge>
                </Td>
                <Td>{row.category}</Td>
                <Td>{row.details}</Td>
                <Td className={row.type === "INCOME" ? "text-emerald-600" : "text-red-600"}>
                  {row.type === "INCOME" ? "+" : "-"}
                  {formatMoney(row.amount)}
                </Td>
                <Td className="font-medium">{formatMoney(row.balance)}</Td>
                <Td>
                  <Link href={`/cashflow/${row.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    {t.common.edit}
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
