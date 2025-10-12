"use client";

import { useState } from "react";
import FreelancerSidebar from "./FreelancerSidebar";
import FreelancerTopbar from "./FreelancerTopbar";

export default function FreelancerShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false); // mobile drawer

  return (
    <div className="role-freelancer bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        {/* Sidebar (desktop fixed + mobile drawer) */}
        <FreelancerSidebar open={open} onClose={() => setOpen(false)} />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <FreelancerTopbar onMenuClick={() => setOpen(true)} />
          <main className="px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
