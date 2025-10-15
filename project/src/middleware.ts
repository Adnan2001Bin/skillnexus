// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_PREFIX = "/admin";
const FREELANCER_PREFIX = "/freelancer";

// 🔒 Routes that should require auth even though they’re not under /client|/freelancer
const GATED_ROUTES = ["/find-freelancers", "/jobs", "/client/messages"];

// Public routes that don't require auth
const PUBLIC_PATHS = ["/api", "/verify", "/onboarding", "/favicon.ico", "/_next", "/images"];

// Entry pages (redirect authed users by role)
const ENTRY_PATHS = ["/", "/sign-in", "/sign-up"];

const isPublic = (pathname: string) =>
  PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

const isEntry = (pathname: string) => ENTRY_PATHS.includes(pathname);

const isGated = (pathname: string) =>
  GATED_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({ req });
  const role = (token as any)?.role as "admin" | "freelancer" | "client" | undefined;

  // 1) If logged in and on an entry page → redirect by role
  if (token && isEntry(pathname)) {
    const dest =
      role === "freelancer" ? "/freelancer/dashboard" :
      role === "admin"      ? "/admin/dashboard"      :
      role === "client"     ? "/home"                 : "/";
    if (dest !== pathname) {
      const url = req.nextUrl.clone();
      url.pathname = dest;
      url.search = ""; // drop entry params
      return NextResponse.redirect(url);
    }
  }

  // 2) Allow public assets/pages through
  if (isPublic(pathname)) return NextResponse.next();

  // 3) Gate protected zones + gated pages
  const isAdminArea = pathname.startsWith(ADMIN_PREFIX);
  const isFreelancerArea = pathname.startsWith(FREELANCER_PREFIX);

  if (!token && (isAdminArea || isFreelancerArea || isGated(pathname))) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    // preserve query so callback goes back exactly where they were
    url.searchParams.set("callbackUrl", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // 4) Enforce role per zone
  if (token) {
    if (isAdminArea && role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    if (isFreelancerArea && role !== "freelancer") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
