// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Change these if your paths differ
const ADMIN_PREFIX = "/admin";
const FREELANCER_PREFIX = "/freelancer";

// Public routes that never need auth (add more if needed)
const PUBLIC_PATHS = [
  "/", 
  "/api",                 // let API decide its own auth
  "/sign-in",
  "/sign-up",
  "/verify",
  "/onboarding",     // if you allow onboarding pre-login, otherwise remove
  "/favicon.ico",
  "/_next",               // next assets
  "/images",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static / public assets
  if (isPublic(pathname)) return NextResponse.next();

  // Try to read the NextAuth token (requires NEXTAUTH_SECRET)
  const token = await getToken({ req });

  // If hitting protected zones without token → go to sign-in
  const isAdminArea = pathname.startsWith(ADMIN_PREFIX);
  const isFreelancerArea = pathname.startsWith(FREELANCER_PREFIX);

  if (!token && (isAdminArea || isFreelancerArea)) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // If we have a token, enforce role
  if (token) {
    const role = (token as any).role as string | undefined;

    // admin zone requires role === "admin"
    if (isAdminArea && role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/"; // or "/freelancer/dashboard"
      return NextResponse.redirect(url);
    }

    // freelancer zone requires role === "freelancer"
    if (isFreelancerArea && role !== "freelancer") {
      const url = req.nextUrl.clone();
      url.pathname = "/"; // or "/admin/dashboard"
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
