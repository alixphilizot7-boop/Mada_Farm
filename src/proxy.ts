import { NextResponse } from "next/server";
import { auth } from "@/auth";

// The Employee role is read-only + "log today's entry" — it has no business
// in the dedicated operational modules (Journal already covers their daily
// input) or in editing existing Journal/Task entries.
const EMPLOYEE_BLOCKED_PREFIXES = ["/flocks", "/eggs", "/chicks", "/inventory", "/health", "/mortality"];

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname.startsWith("/login");

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isLoggedIn && req.auth?.user.role === "EMPLOYEE") {
    const isBlockedModule = EMPLOYEE_BLOCKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    const isJournalEdit = /^\/journal\/[^/]+$/.test(pathname);
    const isTaskEdit = /^\/tasks\/[^/]+$/.test(pathname);
    if (isBlockedModule || isJournalEdit || isTaskEdit) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|icon).*)"],
};
