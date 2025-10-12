"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Images } from "@/lib/images"; // make sure Images.logo is defined

type NavItem = { href: string; label: string };

const CLIENT_LINKS: NavItem[] = [
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/client/projects", label: "Projects" },
  { href: "/client/messages", label: "Messages" },
  { href: "/client/settings", label: "Settings" },
];

export function ClientNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 md:px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="Home" className="flex items-center">
            <Image
              src={Images.logo}
              alt="Logo"
              width={132}
              height={36}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center: Desktop Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {CLIENT_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                isActive(item.href)
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search (optional) */}
          <div className="hidden items-center rounded-lg border border-slate-200 bg-white pl-2 pr-3 md:flex">
            <svg
              className="mr-2 h-4 w-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
            <input
              placeholder="Search..."
              className="h-8 w-40 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Avatar placeholder */}
          <Link
            href="/client/settings"
            className="hidden h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-1 ring-slate-200 md:flex"
            title="Account"
          >
            {/* Replace with user avatar if available */}
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((s) => !s)}
            className="inline-flex items-center rounded-lg border border-slate-200 p-2 md:hidden"
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5 text-slate-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {open ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-3 py-2">
            {CLIENT_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  isActive(item.href)
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full ring-1 ring-slate-200">
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
                <span>Account</span>
              </div>
              <Link
                href="/client/settings"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-emerald-700"
              >
                Manage
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
