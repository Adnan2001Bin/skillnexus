"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  SendHorizonal,
  Eye,
  Search,
  Download,
  FileText,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

type RequirementFile = { name: string; size?: number; url: string };
type RequirementAnswer = {
  id: string;
  text?: string | null;
  options?: string[];
  files?: RequirementFile[];
};
type Requirement =
  | { id: string; type: "text" | "textarea"; question: string; helperText?: string; required?: boolean }
  | { id: string; type: "multiple_choice"; question: string; options: string[]; allowMultiple?: boolean; helperText?: string; required?: boolean }
  | { id: string; type: "file"; question: string; helperText?: string; required?: boolean; accepts?: string[]; maxFiles?: number | null }
  | { id: string; type: "instructions"; content: string };

type OrderRow = {
  id: string;
  orderNumber?: string | null;
  clientEmail?: string | null;
  planType: "Basic" | "Standard" | "Premium";
  price: number;
  paymentStatus: "unpaid" | "paid";
  projectStatus: "pending" | "approved" | "cancelled" | "completed";
  createdAt: string;
};

type OrderDetail = {
  id: string;
  orderNumber?: string | null;
  clientEmail?: string | null;
  planType: "Basic" | "Standard" | "Premium";
  price: number;
  paymentStatus: "unpaid" | "paid";
  projectStatus: "pending" | "approved" | "cancelled" | "completed";
  createdAt: string;
  requirementsSnapshot: Requirement[];
  requirementAnswers: RequirementAnswer[];
};

export default function FreelancerOrdersPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "pending" | "approved" | "completed" | "cancelled">("");
  const [error, setError] = useState<string | null>(null);

  const [viewId, setViewId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (status) qs.set("status", status);
      const res = await fetch(`/api/freelancer/orders?${qs.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load");
      setRows(json.list || []);
    } catch (e: any) {
      setError(e.message || "Error loading");
      toast({ variant: "destructive", title: "Load failed", description: e.message || "Could not load orders." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => rows, [rows]);

  const accept = async (id: string) => {
    const res = await fetch(`/api/freelancer/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast({ variant: "destructive", title: "Accept failed", description: json?.message || "Unable to accept order." });
      return;
    }
    setRows(prev => prev.map(r => r.id === id ? { ...r, projectStatus: "approved" } : r));
    toast({ title: "Order accepted", description: "The project is now in progress." });
  };

  const deliver = async (id: string) => {
    const res = await fetch(`/api/freelancer/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deliver" }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast({ variant: "destructive", title: "Delivery failed", description: json?.message || "Unable to mark as delivered." });
      return;
    }
    setRows(prev => prev.map(r => r.id === id ? { ...r, projectStatus: "completed" } : r));
    toast({ title: "Order delivered", description: "The order is now marked completed." });
  };

  const reject = async () => {
    if (!rejectId) return;
    const res = await fetch(`/api/freelancer/orders/${rejectId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason: rejectReason }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast({ variant: "destructive", title: "Reject failed", description: json?.message || "Unable to reject order." });
      return;
    }
    setRows(prev => prev.map(r => r.id === rejectId ? { ...r, projectStatus: "cancelled" } : r));
    setRejectId(null);
    setRejectReason("");
    toast({ title: "Order rejected", description: "The client will be notified." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search email, order #, plan"
              className="rounded-xl border border-slate-300 bg-white px-9 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button onClick={load}>Search</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No orders found.</td>
              </tr>
            )}
            <AnimatePresence initial={false}>
              {filtered.map((r) => {
                const canAccept = r.projectStatus === "pending";
                const canDeliver = r.projectStatus === "approved";
                const canReject = r.projectStatus === "pending";
                return (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="border-t border-slate-200"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{r.orderNumber || r.id.slice(-8).toUpperCase()}</div>
                      <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1 text-slate-800">
                        <Mail className="h-3.5 w-3.5" /> {r.clientEmail || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{r.planType}</div>
                      <div className="text-xs text-slate-500">${r.price}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={r.paymentStatus === "paid" ? "green" : "amber"}>
                        {r.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          r.projectStatus === "pending" ? "amber" :
                          r.projectStatus === "approved" ? "blue" :
                          r.projectStatus === "completed" ? "green" : "red"
                        }
                      >
                        {r.projectStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setViewId(r.id)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canAccept && (
                          <Button size="sm" onClick={() => accept(r.id)} title="Accept">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {canReject && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={() => setRejectId(r.id)} title="Reject">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject this order?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Optionally add a reason below. The client will be notified.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <textarea
                                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
                                rows={4}
                                placeholder="Reason (optional)"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                              />
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => { setRejectId(null); setRejectReason(""); }}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => reject()}
                                >
                                  Reject
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {canDeliver && (
                          <Button size="sm" onClick={() => deliver(r.id)} title="Mark delivered">
                            <SendHorizonal className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <OrderDrawer id={viewId} onClose={() => setViewId(null)} />
    </div>
  );
}

/* ---------- Small bits ---------- */

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "amber" | "blue" | "red" }) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    red: "bg-red-50 text-red-700 ring-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ring-1 ${map[tone]}`}>{children}</span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-xs uppercase tracking-wide text-slate-500">{children}</div>;
}

/* ---------- Drawer that shows order + requirement answers (files view/download) ---------- */

function OrderDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [o, setO] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/freelancer/orders/${id}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.message || "Failed");
        setO(j.order);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl transform bg-white shadow-2xl transition-transform ${id ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900">Order details</h3>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
      <div className="h-[calc(100dvh-64px)] overflow-y-auto p-5">
        {loading && <div className="text-sm text-slate-500">Loading…</div>}
        {!loading && o && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Order</div>
                  <div className="text-slate-900 font-semibold">{o.orderNumber || o.id.slice(-8).toUpperCase()}</div>
                  <div className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">{o.planType}</div>
                  <div className="text-xs text-slate-500">${o.price}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <SectionTitle>Payment</SectionTitle>
                  <div className="mt-1">
                    <Badge tone={o.paymentStatus === "paid" ? "green" : "amber"}>{o.paymentStatus}</Badge>
                  </div>
                </div>
                <div>
                  <SectionTitle>Status</SectionTitle>
                  <div className="mt-1">
                    <Badge
                      tone={
                        o.projectStatus === "pending" ? "amber" :
                        o.projectStatus === "approved" ? "blue" :
                        o.projectStatus === "completed" ? "green" : "red"
                      }
                    >
                      {o.projectStatus}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <SectionTitle>Client</SectionTitle>
                  <div className="mt-1 inline-flex items-center gap-2 text-slate-800">
                    <Mail className="h-4 w-4" /> {o.clientEmail || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements + answers */}
            <div className="rounded-xl border border-slate-200 p-4">
              <SectionTitle>Requirements</SectionTitle>
              <div className="mt-3 space-y-4">
                {(o.requirementsSnapshot || []).length === 0 && (
                  <div className="text-sm text-slate-500">No requirements provided for this order.</div>
                )}
                {o.requirementsSnapshot.map((rq) => {
                  const ans = (o.requirementAnswers || []).find(a => a.id === rq.id);
                  return (
                    <div key={rq.id} className="rounded-lg border border-slate-200 p-3">
                      {rq.type === "instructions" ? (
                        <>
                          <div className="text-xs font-medium text-slate-500">Instructions</div>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                            {(rq as any).content}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-sm font-semibold text-slate-900">
                            {(rq as any).question || "Question"}
                          </div>
                          {(rq as any).helperText && (
                            <div className="text-xs text-slate-500">{(rq as any).helperText}</div>
                          )}
                          <div className="mt-2 text-sm">
                            {!ans && <div className="text-slate-500 italic">No answer</div>}

                            {/* Text / Textarea */}
                            {ans?.text && (
                              <div className="rounded bg-slate-50 p-2 text-slate-800 whitespace-pre-wrap">
                                {ans.text}
                              </div>
                            )}

                            {/* Multiple choice */}
                            {ans?.options && ans.options.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {ans.options.map((op) => (
                                  <span key={op} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs ring-1 ring-slate-200">
                                    {op}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Files */}
                            {ans?.files && ans.files.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Files</div>
                                <ul className="space-y-2">
                                  {ans.files.map((f, i) => (
                                    <li key={`${f.url}-${i}`} className="flex items-center justify-between gap-3 rounded border border-slate-200 p-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <FileText className="h-4 w-4 text-slate-500" />
                                        <a
                                          href={f.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="truncate text-sm text-emerald-700 underline"
                                        >
                                          {f.name}
                                        </a>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        {typeof f.size === "number" && (
                                          <span className="text-xs text-slate-500">
                                            {Math.round(f.size / 1024)} KB
                                          </span>
                                        )}
                                        <a
                                          href={f.url}
                                          download
                                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                                        >
                                          <Download className="h-3.5 w-3.5" /> Download
                                        </a>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/freelancer/orders" className="text-sm text-emerald-700 underline">
                Back to orders
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
