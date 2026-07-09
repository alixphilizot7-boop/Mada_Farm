import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Bird,
  Egg,
  Feather,
  Wheat,
  Stethoscope,
  HeartCrack,
  Users,
  Receipt,
  Wallet,
  HardHat,
  Target,
  FileBarChart2,
  UserCog,
  History,
  Settings,
  LogOut,
  Sprout,
} from "lucide-react";
import { auth, signOut } from "@/auth";
import { NavLink } from "@/components/nav-link";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/flocks", label: "Flocks", icon: Bird },
  { href: "/eggs", label: "Egg Production", icon: Egg },
  { href: "/chicks", label: "Chick Production", icon: Feather },
  { href: "/inventory", label: "Feed & Water", icon: Wheat },
  { href: "/health", label: "Health", icon: Stethoscope },
  { href: "/mortality", label: "Mortality", icon: HeartCrack },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/cashflow", label: "Cash Flow", icon: Wallet },
];

const ADMIN_NAV = [
  { href: "/capex", label: "Construction & Equipment", icon: HardHat },
  { href: "/business-plan", label: "Business Plan", icon: Target },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/users", label: "Users", icon: UserCog },
  { href: "/audit", label: "Audit Log", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
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
    <div className="flex min-h-screen bg-stone-100 dark:bg-stone-950">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Sprout className="h-5 w-5" />
          </span>
          <div>
            <p className="font-heading text-lg font-semibold leading-tight text-emerald-800 dark:text-emerald-400">
              Mada Farm
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">Farm operations</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href} icon={<item.icon className="h-4 w-4" />}>
              {item.label}
            </NavLink>
          ))}
          {session.user.role === "ADMIN" && (
            <>
              <div className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
                Admin
              </div>
              {ADMIN_NAV.map((item) => (
                <NavLink key={item.href} href={item.href} icon={<item.icon className="h-4 w-4" />}>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
        <div className="border-t border-stone-200 pt-3 dark:border-stone-800">
          <NavLink href="/account">
            <span className="block truncate text-sm font-medium">{session.user.name}</span>
            <span className="block truncate text-xs font-normal text-stone-400">
              {session.user.role} · My account
            </span>
          </NavLink>
          <form action={signOutAction}>
            <button className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800">
              <LogOut className="h-4 w-4 text-stone-400 dark:text-stone-500" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Sprout className="h-4 w-4" />
              </span>
              <p className="font-heading font-semibold text-emerald-800 dark:text-emerald-400">Mada Farm</p>
            </div>
            <form action={signOutAction}>
              <button className="text-sm text-stone-500 dark:text-stone-400">Sign out</button>
            </form>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2">
            {items.map((item) => (
              <NavLink key={item.href} href={item.href} icon={<item.icon className="h-4 w-4" />}>
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
