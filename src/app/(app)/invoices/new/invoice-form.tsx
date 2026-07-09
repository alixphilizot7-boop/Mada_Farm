"use client";

import { useActionState, useState } from "react";
import { createInvoiceAction, updateInvoiceAction } from "../actions";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { formatMoney, toDateInputValue } from "@/lib/format";
import type { Customer, Invoice, InvoiceItem } from "@prisma/client";

type Row = {
  key: number;
  productType: "EGGS" | "CHICKS" | "CHICKEN" | "OTHER";
  description: string;
  quantity: string;
  unitPrice: string;
};

let nextKey = 1;
function emptyRow(): Row {
  return { key: nextKey++, productType: "EGGS", description: "", quantity: "1", unitPrice: "0" };
}

function rowsFromItems(items: InvoiceItem[]): Row[] {
  return items.map((item) => ({
    key: nextKey++,
    productType: item.productType,
    description: item.description,
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
  }));
}

export function InvoiceForm({
  customers,
  invoice,
}: {
  customers: Customer[];
  invoice?: Invoice & { items: InvoiceItem[] };
}) {
  const action = invoice ? updateInvoiceAction : createInvoiceAction;
  const [error, formAction, pending] = useActionState(action, undefined);
  const [rows, setRows] = useState<Row[]>(() => (invoice ? rowsFromItems(invoice.items) : [emptyRow()]));
  const [taxRate, setTaxRate] = useState(() =>
    invoice && invoice.subtotal > 0 ? String((invoice.tax / invoice.subtotal) * 100) : "0"
  );

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  const subtotal = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0), 0);
  const tax = subtotal * (Number(taxRate) / 100 || 0);
  const total = subtotal + tax;

  return (
    <form action={formAction} className="space-y-6">
      {invoice && <input type="hidden" name="id" value={invoice.id} />}
      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Customer">
            <select name="customerId" required defaultValue={invoice?.customerId ?? ""} className={inputClass}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Issue date">
            <input
              name="issueDate"
              type="date"
              required
              defaultValue={invoice ? toDateInputValue(invoice.issueDate) : new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
          </Field>
          <Field label="Due date">
            <input
              name="dueDate"
              type="date"
              defaultValue={invoice?.dueDate ? toDateInputValue(invoice.dueDate) : ""}
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Line items</h2>
          <Button type="button" variant="secondary" onClick={() => setRows((prev) => [...prev, emptyRow()])}>
            Add line
          </Button>
        </div>

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.key} className="grid gap-2 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-2">
                <Field label="Product">
                  <select
                    name="productType"
                    value={row.productType}
                    onChange={(e) => updateRow(row.key, { productType: e.target.value as Row["productType"] })}
                    className={inputClass}
                  >
                    <option value="EGGS">Eggs</option>
                    <option value="CHICKS">Chicks</option>
                    <option value="CHICKEN">Chicken</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Field>
              </div>
              <div className="sm:col-span-4">
                <Field label="Description">
                  <input
                    name="description"
                    required
                    value={row.description}
                    onChange={(e) => updateRow(row.key, { description: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Quantity">
                  <input
                    name="quantity"
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={row.quantity}
                    onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Unit price">
                  <input
                    name="unitPrice"
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={row.unitPrice}
                    onChange={(e) => updateRow(row.key, { unitPrice: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="flex items-center justify-between gap-2 sm:col-span-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-300">
                  {formatMoney((Number(row.quantity) || 0) * (Number(row.unitPrice) || 0))}
                </span>
                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tax rate (%)">
            <input
              name="taxRate"
              type="number"
              min={0}
              step="any"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <input name="notes" defaultValue={invoice?.notes ?? ""} className={inputClass} />
            </Field>
          </div>
        </div>
        <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Tax</span>
            <span>{formatMoney(tax)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-zinc-900 dark:text-zinc-50">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : invoice ? "Save changes" : "Create invoice"}
      </Button>
    </form>
  );
}
