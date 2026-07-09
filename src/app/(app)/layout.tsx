import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { NavLink } from "@/components/nav-link";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/flocks", label: "Flocks" },
  { href: "/eggs", label: "Egg Production" },
  { href: "/chicks", label: "Chick Production" },
  { href: "/inventory", label: "Feed & Water" },
  { href: "/health", label: "Health" },
  { href: "/mortality", label: "Mortality" },
  { href: "/customers", label: "Customers" },
  { href: "/invoices", label: "Invoices" },
  { href: "/cashflow", label: "Cash Flow" },
];

const ADMIN_NAV = [
  { href: "/capex", label: "Construction & Equipment" },
  { href: "/business-plan", label: "Business Plan" },
  { href: "/reports", label: "Reports" },
  { href: "/users", label: "Users" },
  { href: "/audit", label: "Audit Log" },
  { href: "/settings", label: "Settings" },
];

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const items = session.user.role === "ADMIN" ? [...NAV, ...ADMIN_NAV] : NAV;

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex">
        <div className="mb-6 px-2">
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Mada Farm</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Farm operations</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          {session.user.role === "ADMIN" && (
            <>
              <div className="mb-1 mt-4 px-3 text-xs font-semibold uppercase text-zinc-400">
                Admin
              </div>
              {ADMIN_NAV.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
        <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <NavLink href="/account">
            <span className="block truncate text-sm font-medium">{session.user.name}</span>
            <span className="block truncate text-xs font-normal text-zinc-400">
              {session.user.role} · My account
            </span>
          </NavLink>
          <form action={signOutAction}>
            <button className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="font-bold text-emerald-700 dark:text-emerald-400">Mada Farm</p>
            <form action={signOutAction}>
              <button className="text-sm text-zinc-500 dark:text-zinc-400">Sign out</button>
            </form>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2">
            {items.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
