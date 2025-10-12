// components/admin/AdminSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Images } from "@/lib/images";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  BarChart3,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/freelancers", label: "Freelancers", icon: Briefcase },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  const handleLogout = async () => {
    // optional: confirm
    // if (!confirm("Sign out of the admin panel?")) return;
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed z-40 flex h-full w-72 flex-col border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4">
          <Image
            src={Images.logo}
            alt="Logo"
            width={140}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ring-1 ring-transparent ${
                  active
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setOpen(false)}
              >
                <Icon
                  className={`h-4 w-4 ${
                    active ? "text-emerald-600" : "text-slate-500"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: user + logout */}
        <div className="border-t border-slate-200 p-3">
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
                  {user.name ?? user.email}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {user.email}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>

        {/* Collapse button (mobile) */}
        <button
          onClick={() => setOpen(false)}
          className="m-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 md:hidden"
        >
          Close
        </button>
      </aside>

      {/* Mobile open button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-30 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow md:hidden"
        aria-label="Open sidebar"
      >
        Menu
      </button>
    </>
  );
}
