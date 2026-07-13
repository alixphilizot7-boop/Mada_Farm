import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(87,68,32,0.04),0_8px_20px_-12px_rgba(87,68,32,0.18)] dark:border-stone-800 dark:bg-stone-900 dark:shadow-none",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  type = "button",
  className,
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  type?: "button" | "submit" | "reset";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md active:bg-emerald-800",
        variant === "secondary" &&
          "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800",
        variant === "danger" && "bg-red-600 text-white shadow-sm hover:bg-red-700",
        variant === "ghost" &&
          "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
        variant === "primary" && "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md",
        variant === "secondary" &&
          "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800",
        variant === "danger" && "bg-red-600 text-white shadow-sm hover:bg-red-700",
        variant === "ghost" &&
          "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "zinc",
}: {
  children: ReactNode;
  tone?: "zinc" | "green" | "red" | "amber" | "blue";
}) {
  const tones: Record<string, string> = {
    zinc: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  };
  return (
    <span className={clsx("rounded-full px-2 py-0.5 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
      <table className="w-full min-w-max text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={clsx("px-4 py-3 font-medium", className)}>{children}</th>;
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={clsx("px-4 py-3 text-stone-700 dark:text-stone-300", className)}>{children}</td>;
}

export function TBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">{children}</tbody>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
        {label}
      </span>
      {children}
    </label>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "emerald",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ComponentType<{ className?: string }>;
  tone?: "emerald" | "amber" | "red" | "blue" | "stone";
}) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    red: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    stone: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
  };
  return (
    <Card className="flex items-start gap-3">
      <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
        <p className="font-heading text-xl font-semibold text-stone-900 dark:text-stone-50">{value}</p>
        {hint}
      </div>
    </Card>
  );
}
