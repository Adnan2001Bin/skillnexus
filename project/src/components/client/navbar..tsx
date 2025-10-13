"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

// shadcn/ui
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
  { href: "/find-freelancers", label: "Find Freelancers", icon: <Users className="h-4 w-4" /> },
  { href: "/jobs", label: "Jobs", icon: <Briefcase className="h-4 w-4" /> },
  { href: "/client/messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
];

export default function ClientNavbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isAuthed = status === "authenticated";
  const user: any = session?.user || {};
  const avatar =
    user?.profilePicture ||
    (typeof user?.image === "string" ? user.image : "") ||
    "/images/avatar-placeholder.png";
  const displayName =
    user?.userName || user?.name || user?.email?.split("@")?.[0] || "You";

  const [scrolled, setScrolled] = React.useState(false);

  // transparent -> solid on scroll
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // styles that flip with scroll
  const navWrap =
    "fixed top-0 z-50 w-full transition-colors duration-300 " +
    (scrolled ? "bg-white text-slate-800 shadow" : "bg-transparent text-white");
  const linkBase = "rounded-lg px-3 py-2 text-sm transition";
  const linkIdle = scrolled
    ? "text-slate-700 hover:bg-slate-100"
    : "text-white/90 hover:bg-white/10";
  const linkActive = scrolled
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
    : "bg-white/15 text-white ring-1 ring-white/30";

  return (
    <header className={navWrap}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 md:gap-4 md:px-6">
        {/* Left: Mobile menu */}
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
                    src={scrolled ? Images.logo : Images.logo1}
                    alt="Logo"
                    width={120}
                    height={32}
                    className="h-8 w-auto object-contain"
                  />
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-1">
                {publicLinks.map((l) => {
                  const active = pathname === l.href || pathname?.startsWith(l.href + "/");
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={[
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                        active
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {l.icon} <span>{l.label}</span>
                    </Link>
                  );
                })}

                {!isAuthed ? (
                  <div className="space-y-2 pt-3">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/sign-in">Sign in</Link>
                    </Button>
                    <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600">
                      <Link href="/sign-up">Sign up</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <Button asChild className="w-full">
                      <Link href="/client/post-job">
                        <Plus className="mr-2 h-4 w-4" />
                        Post a job
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          {/* Desktop logo (swap on scroll) */}
          <Image
            src={scrolled ? Images.logo : Images.logo1}
            alt="Logo"
            width={140}
            height={36}
            className="hidden h-9 w-auto object-contain sm:block"
            priority
          />
          {/* Mobile logo (swap on scroll) */}
          <Image
            src={scrolled ? Images.logo : Images.logo1}
            alt="Logo"
            width={110}
            height={32}
            className="block h-8 w-auto object-contain sm:hidden"
            priority
          />
        </Link>

        {/* Center: NAV ONLY (search removed, items centered) */}
        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {publicLinks.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${linkBase} ${active ? linkActive : linkIdle} flex items-center gap-2`}
              >
                {l.icon}
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: actions */}
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {!isAuthed ? (
            <>
              <Button asChild variant={scrolled ? "outline" : "secondary"}>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="hidden md:inline-flex">
                <Link href="/client/post-job">
                  <Plus className="mr-2 h-4 w-4" />
                  Post a job
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                asChild
                aria-label="Notifications"
                className={scrolled ? "" : "text-white hover:bg-white/10"}
              >
                <Link href="/client/notifications">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center gap-2 rounded-full p-1 outline-none ring-offset-2 focus:ring-2 focus:ring-emerald-500 ${scrolled ? "" : "text-white"}`}
                    aria-label="Account menu"
                  >
                    <Avatar className="h-8 w-8 ring-1 ring-slate-200">
                      <AvatarImage src={avatar} alt={displayName} />
                      <AvatarFallback>
                        {displayName?.slice(0, 1)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="truncate font-medium">{displayName}</div>
                    <div className="truncate text-xs text-slate-500">{user?.email}</div>
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
      {/* Mobile search block removed since banner now owns search */}
    </header>
  );
}
