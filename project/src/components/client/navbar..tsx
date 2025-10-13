"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, Menu, MessageSquare, Settings, LogOut, User, Plus, Search } from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Images } from "@/lib/images";

type LinkItem = { href: string; label: string };

const links: LinkItem[] = [
  { href: "/home", label: "Home" },
  { href: "/client/find", label: "Find talent" }, // NEW
  { href: "/client/jobs", label: "Jobs" },        // NEW
  { href: "/client/messages", label: "Messages" },
];

export default function ClientNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";

  const user: any = session?.user || {};
  const avatar =
    user?.profilePicture ||
    (typeof user?.image === "string" ? user.image : "") ||
    "/images/avatar-placeholder.png";
  const displayName = user?.userName || user?.name || user?.email?.split("@")?.[0] || "You";

  const [q, setQ] = React.useState("");

  // scroll state -> toggles transparent vs solid styles
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/client/find?q=${encodeURIComponent(q.trim())}`);
  };

  const colorClasses = scrolled
    ? {
        header: "bg-white/90 backdrop-blur border-b border-slate-200",
        link: "text-slate-700 hover:bg-slate-100",
        active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        icon: "text-slate-700",
        cta: "bg-emerald-600 text-white hover:bg-emerald-700",
        input: "",
        logoFilter: "",
      }
    : {
        header: "bg-transparent",
        link: "text-white/90 hover:bg-white/10",
        active: "bg-white/15 text-white ring-1 ring-white/30",
        icon: "text-white",
        cta: "bg-white text-slate-900 hover:bg-white/90",
        input: "bg-white/10 placeholder:text-white/60 text-white border-white/20 focus:ring-white/50",
        logoFilter: "brightness-0 invert",
      };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="hidden items-center gap-1 md:flex">
      {links.map((l) => {
        const active = pathname === l.href || pathname?.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onClick}
            className={[
              "rounded-lg px-3 py-2 text-sm transition",
              active ? colorClasses.active : colorClasses.link,
            ].join(" ")}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full transition-colors",
        colorClasses.header,
        scrolled ? "" : "border-b-0",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 md:gap-4 md:px-6">
        {/* Left: Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className={`h-5 w-5 ${colorClasses.icon}`} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Image
                    src={Images.logo}
                    alt="Logo"
                    width={120}
                    height={32}
                    className="h-8 w-auto object-contain"
                  />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-1">
                {links.map((l) => {
                  const active = pathname === l.href || pathname?.startsWith(l.href + "/");
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={[
                        "block rounded-lg px-3 py-2 text-sm",
                        active
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {l.label}
                    </Link>
                  );
                })}
                <div className="pt-2">
                  {isAuthed ? (
                    <Button asChild className="w-full">
                      <Link href="/client/post-job">
                        <Plus className="mr-2 h-4 w-4" />
                        Post a job
                      </Link>
                    </Button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="outline">
                        <Link href="/sign-in">Sign in</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/sign-up">Sign up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <Image
            src={Images.logo}
            alt="Logo"
            width={140}
            height={36}
            className={`hidden h-9 w-auto object-contain sm:block ${scrolled ? "" : colorClasses.logoFilter}`}
            priority
          />
          <Image
            src={Images.logo}
            alt="Logo"
            width={110}
            height={32}
            className={`block h-8 w-auto object-contain sm:hidden ${scrolled ? "" : colorClasses.logoFilter}`}
            priority
          />
        </Link>

        {/* Center: nav + search */}
        <div className="flex flex-1 items-center gap-3">
          <NavLinks />
          <form onSubmit={onSearch} className="ml-auto hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search freelancers, skills, services…"
                className={["pl-9", colorClasses.input].join(" ")}
              />
              <Search
                className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${colorClasses.icon}`}
              />
            </div>
          </form>
        </div>

        {/* Right: actions (authed vs guest) */}
        <div className="flex items-center gap-2 md:gap-3">
          {isAuthed ? (
            <>
              <Button asChild className={colorClasses.cta + " hidden md:inline-flex"}>
                <Link href="/client/post-job">
                  <Plus className="mr-2 h-4 w-4" />
                  Post a job
                </Link>
              </Button>

              <Button variant="ghost" size="icon" asChild aria-label="Messages">
                <Link href="/client/messages">
                  <MessageSquare className={`h-5 w-5 ${colorClasses.icon}`} />
                </Link>
              </Button>

              <Button variant="ghost" size="icon" asChild aria-label="Notifications">
                <Link href="/client/notifications">
                  <Bell className={`h-5 w-5 ${colorClasses.icon}`} />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex items-center gap-2 rounded-full p-1 outline-none ring-offset-2 focus:ring-2 focus:ring-emerald-500"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-8 w-8 ring-1 ring-slate-200">
                      <AvatarImage src={avatar} alt={displayName} />
                      <AvatarFallback>{displayName?.slice(0, 1)?.toUpperCase() ?? "U"}</AvatarFallback>
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
          ) : (
            <>
              <Button variant={scrolled ? "outline" : "secondary"} asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button className={colorClasses.cta} asChild>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile search under bar */}
      <div className="block px-3 py-2 md:hidden">
        <form onSubmit={onSearch}>
          <div className="relative">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search freelancers, skills, services…"
              className={["pl-9", scrolled ? "" : colorClasses.input].join(" ")}
            />
            <Search
              className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                scrolled ? "text-slate-500" : "text-white"
              }`}
            />
          </div>
        </form>
      </div>
    </header>
  );
}
