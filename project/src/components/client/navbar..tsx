// src/components/common/ClientNavbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Bell,
  Menu,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Plus,
  Briefcase,
  Users,
  Receipt,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Images } from "@/lib/images";

type LinkItem = { href: string; label: string; icon?: React.ReactNode };

const publicLinks: LinkItem[] = [
  {
    href: "/find-freelancers",
    label: "Find Freelancers",
    icon: <Users className="h-4 w-4" />,
  },
  { href: "/jobs", label: "Jobs", icon: <Briefcase className="h-4 w-4" /> },
  {
    href: "/client/messages",
    label: "Messages",
    icon: <MessageSquare className="h-4 w-4" />,
  },
];

export default function ClientNavbar() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";

  // ⛔️ Hide navbar on freelancer/admin areas (and subpaths).
  // If you want exact match only, replace startsWith checks with strict equality.
  const HIDE_PREFIXES = ["/freelancer", "/admin"];
  const hideNavbar = HIDE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (hideNavbar) return null;

  // Minimal routes: show only logo and force solid nav
  const minimalPaths = new Set([
    "/sign-in",
    "/sign-up",
    "/onboarding/client",
    "/onboarding/freelancer",
  ]);
  const isMinimal = minimalPaths.has(pathname);

  // —— fetch client profile for avatar ——
  const [clientProfile, setClientProfile] = React.useState<{
    userName?: string;
    email?: string;
    profilePicture?: string | null;
  } | null>(null);

  React.useEffect(() => {
    if (!isAuthed) {
      setClientProfile(null);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/client", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.success && json?.data) {
          setClientProfile({
            userName: json.data.userName,
            email: json.data.email,
            profilePicture: json.data.profilePicture ?? null,
          });
        }
      } catch (e) {
        console.error("Failed to load client /me", e);
      }
    })();
  }, [isAuthed]);

  const sessionUser: any = session?.user || {};
  const displayName =
    clientProfile?.userName ||
    sessionUser?.userName ||
    sessionUser?.name ||
    sessionUser?.email?.split("@")?.[0] ||
    "You";

  const avatarSrc =
    clientProfile?.profilePicture ||
    sessionUser?.profilePicture ||
    (typeof sessionUser?.image === "string" ? sessionUser.image : "") ||
    "/images/avatar-placeholder.png";

  // scroll style control + solid on detail (ignored on minimal)
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isFreelancerDetail =
    pathname.startsWith("/find-freelancers/") &&
    pathname.split("/").filter(Boolean).length === 2;

  const orderPaths = pathname.startsWith("/orders");
  const solidNav = isMinimal || isFreelancerDetail || scrolled || orderPaths;

  // gated nav
  const gated = new Set<string>([
    "/find-freelancers",
    "/jobs",
    "/client/messages",
  ]);
  const go = (href: string) => {
    if (!isAuthed && gated.has(href)) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
  };

  const navWrap =
    "fixed top-0 z-50 w-full transition-colors duration-300 " +
    (solidNav ? "bg-white text-slate-800 shadow" : "bg-transparent text-white");
  const linkBase = "rounded-lg px-3 py-2 text-sm transition";
  const linkIdle = solidNav
    ? "text-slate-700 hover:bg-slate-100"
    : "text-white/90 hover:bg-white/10";
  const linkActive = solidNav
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
    : "bg-white/15 text-white ring-1 ring-white/30";

  // ——— Minimal header (logo only) ———
  if (isMinimal) {
    return (
      <header className={navWrap}>
        <div className="mx-auto flex h-16 max-w-7xl items-center px-3 md:px-6">
          <Link href="/home" className="flex items-center gap-2">
            <Image
              src={Images.logo}
              alt="Logo"
              width={140}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
        </div>
      </header>
    );
  }

  // ——— Full header ———
  return (
    <header className={navWrap}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 md:gap-4 md:px-6">
        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Image
                    src={solidNav ? Images.logo : Images.logo1}
                    alt="Logo"
                    width={120}
                    height={32}
                    className="h-8 w-auto object-contain"
                  />
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-1">
                {publicLinks.map((l) => {
                  const active =
                    pathname === l.href || pathname.startsWith(l.href + "/");
                  return (
                    <button
                      key={l.href}
                      onClick={() => go(l.href)}
                      className={[
                        "w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                        active
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {l.icon} <span>{l.label}</span>
                    </button>
                  );
                })}

                {!isAuthed ? (
                  <div className="space-y-2 pt-3">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/sign-in">Sign in</Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Link href="/sign-up">Sign up</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <Button
                      className="w-full"
                      onClick={() => go("/client/post-job")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Post a job
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <Image
            src={solidNav ? Images.logo : Images.logo1}
            alt="Logo"
            width={140}
            height={36}
            className="hidden h-9 w-auto object-contain sm:block"
            priority
          />
          <Image
            src={solidNav ? Images.logo : Images.logo1}
            alt="Logo"
            width={110}
            height={32}
            className="block h-8 w-auto object-contain sm:hidden"
            priority
          />
        </Link>

        {/* Center nav */}
        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {publicLinks.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <button
                key={l.href}
                onClick={() => go(l.href)}
                className={`${linkBase} ${
                  active ? linkActive : linkIdle
                } flex items-center gap-2`}
              >
                {l.icon}
                <span>{l.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {!isAuthed ? (
            <>
              <Button asChild variant={solidNav ? "outline" : "secondary"}>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                className="hidden md:inline-flex"
                onClick={() => go("/client/post-job")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Post a job
              </Button>

              <Button
                variant="ghost"
                size="icon"
                asChild
                aria-label="Notifications"
                className={solidNav ? "" : "text-white hover:bg-white/10"}
              >
                <Link href="/client/notifications">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center gap-2 rounded-full p-1 outline-none ring-offset-2 focus:ring-2 focus:ring-emerald-500 ${
                      solidNav ? "" : "text-white"
                    }`}
                    aria-label="Account menu"
                  >
                    <Avatar className="h-8 w-8 ring-1 ring-slate-200">
                      <AvatarImage src={avatarSrc} alt={displayName} />
                      <AvatarFallback>
                        {displayName?.slice(0, 1)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="truncate font-medium">{displayName}</div>
                    <div className="truncate text-xs text-slate-500">
                      {clientProfile?.email || sessionUser?.email}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/client/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/client/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/client/orders" className="flex items-center">
                      <Receipt className="mr-2 h-4 w-4" />
                      <span>My orders</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
