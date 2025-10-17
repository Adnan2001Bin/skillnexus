"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Order = {
  id: string;
  freelancerName: string;
  planType: "Basic" | "Standard" | "Premium";
  price: number;
  paymentStatus: "unpaid" | "paid";
  projectStatus: "pending" | "approved" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export default function ClientOrdersPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  // local UI filters (client-side)
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<
    "" | "unpaid" | "paid" | "pending" | "approved" | "cancelled"
  >("");

  // For demo without auth, you can pass ?email= in the URL and we’ll include it in the fetch
  const demoEmail = params.get("email") || "";

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (demoEmail) qs.set("email", demoEmail);
      const res = await fetch(`/api/client/orders?${qs.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load orders");
      setOrders(json.orders || []);
    } catch (e: any) {
      setError(e.message || "Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (orders || []).filter((o) => {
      const matchQ =
        !term ||
        o.freelancerName.toLowerCase().includes(term) ||
        o.planType.toLowerCase().includes(term) ||
        String(o.price).includes(term);
      const matchStatus =
        !status || o.paymentStatus === status || o.projectStatus === status;
      return matchQ && matchStatus;
    });
  }, [orders, q, status]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 mt-14 font-sans">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="text-sm text-slate-600">
            View your purchases, payment status, and project progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => reload()}
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by freelancer, plan, or price"
            className="rounded-xl border border-slate-300 bg-white px-9 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
            onKeyDown={(e) => e.key === "Enter" && setQ(e.currentTarget.value)}
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
        >
          <option value="">All statuses</option>
          <optgroup label="Payment">
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </optgroup>
          <optgroup label="Project">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
          </optgroup>
        </select>
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {loading && <OrdersSkeleton />}

        {!loading && error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && <EmptyState />}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {filtered.map((o) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-slate-600">Freelancer</div>
                        <div className="text-base font-semibold text-slate-900">
                          {o.freelancerName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600">Total</div>
                        <div className="text-lg font-bold text-slate-900">
                          ${o.price}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
                        {o.planType}
                      </span>
                      <PaymentBadge status={o.paymentStatus} />
                      <ProjectBadge status={o.projectStatus} />
                    </div>
                  </div>

                  {/* Progress-ish row */}
                  <div className="p-4">
                    <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                      Progress
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${computeProgress(o)}%` }}
                        aria-label={`Progress ${computeProgress(o)}%`}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      {progressLabel(o)}
                    </div>

                    {/* Footer actions (wire up later to details page or messages) */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-slate-500">
                        Placed: {new Date(o.createdAt).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          asChild
                        >
                          <a href={`/client/messages?order=${o.id}`}>Message</a>
                        </Button>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700"
                          asChild
                        >
                          <a href={`/client/orders/${o.id}`}>View details</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- tiny components ---------- */

function OrdersSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-2 w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-1 h-2 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 flex items-center justify-end gap-2">
            <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-28 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center">
      <BadgeCheck className="h-8 w-8 text-slate-400" />
      <div className="mt-2 text-lg font-semibold text-slate-900">
        No orders yet
      </div>
      <div className="mt-1 max-w-md text-sm text-slate-600">
        When you purchase a package from a freelancer, your order will appear
        here.
      </div>
      <div className="mt-4">
        <Button asChild>
          <a href="/find-freelancers">Find freelancers</a>
        </Button>
      </div>
    </div>
  );
}

function PaymentBadge({ status }: { status: "unpaid" | "paid" }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
        <CreditCard className="h-3.5 w-3.5" /> Paid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 ring-1 ring-amber-200">
      <CreditCard className="h-3.5 w-3.5" /> Unpaid
    </span>
  );
}

function ProjectBadge({
  status,
}: {
  status: "pending" | "approved" | "cancelled";
}) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700 ring-1 ring-red-200">
        <XCircle className="h-3.5 w-3.5" /> Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 ring-1 ring-amber-200">
      <Clock className="h-3.5 w-3.5" /> Pending
    </span>
  );
}

function computeProgress(o: Order): number {
  // simple heuristic:
  // unpaid -> 25%, paid + pending -> 60%, approved -> 100%, cancelled -> 0%
  if (o.projectStatus === "cancelled") return 0;
  if (o.projectStatus === "approved") return 100;
  if (o.paymentStatus === "paid") return 60;
  return 25;
}

function progressLabel(o: Order) {
  if (o.projectStatus === "cancelled") return "Cancelled";
  if (o.projectStatus === "approved") return "Completed";
  if (o.paymentStatus === "paid") return "Payment received. Awaiting approval.";
  return "Awaiting payment";
}
