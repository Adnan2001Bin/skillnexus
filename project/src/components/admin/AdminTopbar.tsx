// components/admin/AdminTopbar.tsx
"use client";

import Image from "next/image";
import { Images } from "@/lib/images";
import { Bell, Search } from "lucide-react";

export default function AdminTopbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: logo for mobile only (desktop uses sidebar) */}
        <div className="flex items-center gap-3 md:hidden">
          <Image
            src={Images.logo}
            alt="Logo"
            width={120}
            height={36}
            className="object-contain"
            priority
          />
        </div>

        {/* Center: search */}
        <div className="hidden flex-1 items-center md:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-emerald-500 focus:ring-2"
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50">
            <Bell className="h-4 w-4 text-slate-600" />
          </button>
          <div className="ml-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1">
            <div className="h-7 w-7 rounded-full bg-emerald-100 ring-1 ring-emerald-200" />
            <span className="hidden text-sm text-slate-700 sm:inline">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
