// components/freelancer/FreelancerSidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Mail,
  Wallet,
  Settings,
  LogOut,
} from "lucide-react";
import { Images } from "@/lib/images";
import { useSession, signOut } from "next-auth/react";
import { useCallback } from "react";

type Props = { open: boolean; onClose: () => void };

const nav = [
  { href: "/freelancer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/freelancer/projects", label: "Projects", icon: Briefcase },
  { href: "/freelancer/messages", label: "Messages", icon: Mail },
  { href: "/freelancer/earnings", label: "Earnings", icon: Wallet },
  { href: "/freelancer/settings", label: "Settings", icon: Settings },
];

export default function FreelancerSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: "/auth/login" });
  }, []);

  const baseItem =
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition focus:outline-none";
  const activeItem = "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  const idleItem = "text-slate-600 hover:bg-slate-50";

  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer (mobile) / Static (desktop) */}
      <aside
        className={`fixed z-50 flex h-full w-72 flex-col border-r border-slate-200 bg-white p-4 shadow-lg transition-transform md:sticky md:top-0 md:z-auto md:h-[calc(100vh)] md:translate-x-0 md:p-6 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Freelancer navigation"
      >
        {/* Logo */}
        <Link href="/" className="mb-6 flex items-center gap-2" onClick={onClose}>
          <Image
            src={Images.logo}
            alt="Logo"
            width={140}
            height={36}
            className="h-9 w-auto object-contain"
            priority
          />
          <span className="sr-only">Home</span>
        </Link>

        {/* Nav */}
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`${baseItem} ${active ? activeItem : idleItem}`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    active ? "text-emerald-600" : "text-slate-500"
                  }`}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: user + logout */}
        <div className="mt-auto">
          <div className="my-6 h-px w-full bg-slate-200" />
          {user && (
            <div className="mb-2 flex items-center gap-3 rounded-lg bg-slate-50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={(user as any)?.image || "/avatar-placeholder.png"}
                alt={user.name ?? "User"}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-800">
                  {user.userName ?? user.email}
                </div>
                <div className="truncate text-xs text-slate-500">{user.email}</div>
              </div>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>

          {/* Mobile close control */}
          <button
            onClick={onClose}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 md:hidden"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
}
