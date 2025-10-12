"use client";

import Image from "next/image";
import { Bell, Menu } from "lucide-react";
import { Images } from "@/lib/images";

export default function FreelancerTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 md:h-16 md:px-8">
        {/* Left: mobile menu + (small) logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 ring-emerald-500 transition hover:bg-slate-50 focus:outline-none focus:ring-2 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Small logo for mobile topbar */}
          <div className="md:hidden">
            <Image
              src={Images.logo}
              alt="Logo"
              width={110}
              height={28}
              className="h-7 w-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Center: search (optional) */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="w-full max-w-lg">
            <input
              placeholder="Search projects, messages…"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-emerald-500 focus:ring-2"
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
            {/* ping dot */}
            <span className="absolute right-1 top-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
          </button>

          {/* Avatar placeholder */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
            <span className="text-sm font-semibold">FL</span>
          </div>
        </div>
      </div>
    </header>
  );
}
