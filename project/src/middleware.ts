// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Zones
const ADMIN_PREFIX = "/admin";
const FREELANCER_PREFIX = "/freelancer";

// Public routes that don't require auth
const PUBLIC_PATHS = [
  "/api",          // let API handle its own auth
  "/verify",
  "/onboarding",
  "/favicon.ico",
  "/_next",
  "/images",
];

// "Entry" pages: if a logged-in user lands here, redirect by role
const ENTRY_PATHS = ["/", "/sign-in", "/sign-up"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
function isEntry(pathname: string) {
  return ENTRY_PATHS.includes(pathname);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read the NextAuth token first (requires NEXTAUTH_SECRET)
  const token = await getToken({ req });
  const role = (token as any)?.role as "admin" | "freelancer" | "client" | undefined;

  // 1) If logged in and on an entry page → redirect by role
  if (token && isEntry(pathname)) {
    const redirectMap: Record<string, string> = {
      freelancer: "/freelancer/dashboard",
      admin: "/admin/dashboard",
      client: "/home",
    };
    const dest = redirectMap[role || ""] || "/"; // fallback just in case
    if (dest !== pathname) {
      const url = req.nextUrl.clone();
      url.pathname = dest;
      url.search = ""; // drop any sign-in/sign-up query params
      return NextResponse.redirect(url);
    }
  }

  // 2) Allow public assets/pages through (except the entry paths above which we handled)
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // 3) Gate the protected zones
  const isAdminArea = pathname.startsWith(ADMIN_PREFIX);
  const isFreelancerArea = pathname.startsWith(FREELANCER_PREFIX);

  // Not logged in but trying to access protected zones → go to sign-in
  if (!token && (isAdminArea || isFreelancerArea)) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("callbackUrl", pathname);
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

// Only run on these routes
export const config = {
  matcher: [
    // protect everything except Next internals & public files
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
