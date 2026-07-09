"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { ReactNode } from "react";

export function NavLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={clsx(
        "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
      )}
    >
      {icon && (
        <span className={clsx("flex h-4 w-4 shrink-0", active ? "text-white" : "text-stone-400 dark:text-stone-500")}>
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </Link>
  );
}
