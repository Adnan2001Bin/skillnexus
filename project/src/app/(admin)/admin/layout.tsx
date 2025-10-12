// app/(admin)/layout.tsx
import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    // Use a wrapper div to scope admin styles, not <body>
    <div className="role-admin bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <AdminTopbar />
          <main className="px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
