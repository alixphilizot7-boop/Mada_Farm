"use client";

import { useActionState, useState } from "react";
import { createInvoiceAction, updateInvoiceAction } from "../actions";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { formatMoney, toDateInputValue } from "@/lib/format";
import { useI18n } from "@/components/i18n-provider";
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
  const { t } = useI18n();
  const f = t.invoices.form;

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
          <Field label={f.customer}>
            <select name="customerId" required defaultValue={invoice?.customerId ?? ""} className={inputClass}>
              <option value="">{f.selectCustomer}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={f.issueDate}>
            <input
              name="issueDate"
              type="date"
              required
              defaultValue={invoice ? toDateInputValue(invoice.issueDate) : new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
          </Field>
          <Field label={f.dueDate}>
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
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200">{f.lineItems}</h2>
          <Button type="button" variant="secondary" onClick={() => setRows((prev) => [...prev, emptyRow()])}>
            {f.addLine}
          </Button>
        </div>

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.key} className="grid gap-2 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-2">
                <Field label={f.product}>
                  <select
                    name="productType"
                    value={row.productType}
                    onChange={(e) => updateRow(row.key, { productType: e.target.value as Row["productType"] })}
                    className={inputClass}
                  >
                    <option value="EGGS">{t.productType.EGGS}</option>
                    <option value="CHICKS">{t.productType.CHICKS}</option>
                    <option value="CHICKEN">{t.productType.CHICKEN}</option>
                    <option value="OTHER">{t.productType.OTHER}</option>
                  </select>
                </Field>
              </div>
              <div className="sm:col-span-4">
                <Field label={f.description}>
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
                <Field label={f.quantity}>
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
                <Field label={f.unitPrice}>
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
                <span className="text-sm text-stone-600 dark:text-stone-300">
                  {formatMoney((Number(row.quantity) || 0) * (Number(row.unitPrice) || 0))}
                </span>
                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                  >
                    {f.remove}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={f.taxRate}>
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
            <Field label={f.notes}>
              <input name="notes" defaultValue={invoice?.notes ?? ""} className={inputClass} />
            </Field>
          </div>
        </div>
        <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">{f.subtotal}</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">{f.tax}</span>
            <span>{formatMoney(tax)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-stone-900 dark:text-stone-50">
            <span>{f.total}</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? f.saving : invoice ? f.saveChanges : f.create}
      </Button>
    </form>
  );
}
