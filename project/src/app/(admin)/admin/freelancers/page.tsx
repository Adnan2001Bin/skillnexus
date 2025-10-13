// src/app/(admin)/admin/freelancers/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Eye, Trash2, Search } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// ⬇️ shadcn imports
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"; // optional if you prefer shadcn buttons

type Profile = {
  _id: string;
  user: string;
  userName: string;
  email: string;
  location?: string | null;
  profilePicture?: string | null;
  category?: string | null;
  services?: string[];
  skills?: string[];
  portfolioCount: number;
  categoryLabel?: string | null;
  ratePlans: { type: string; price: number }[];
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminFreelancersPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "pending" | "approved" | "rejected">("");
  const [error, setError] = useState<string | null>(null);

  const [viewId, setViewId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // new: delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (status) qs.set("status", status);
      const res = await fetch(`/api/admin/freelancers?${qs.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load");
      setList(json.list || []);
    } catch (e: any) {
      setError(e.message || "Error");
      toast({
        variant: "destructive",
        title: "Load failed",
        description: e.message || "Could not load freelancers.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => list, [list]);

  const approve = async (id: string) => {
    const res = await fetch(`/api/admin/freelancers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    const json = await res.json();

    if (!res.ok) {
      toast({
        variant: "destructive",
        title: "Approve failed",
        description: json?.message || "Unable to approve profile.",
      });
      return;
    }

    setList(prev =>
      prev.map(p => (p._id === id ? { ...p, approvalStatus: "approved", rejectionReason: null } : p))
    );
    toast({ title: "Profile approved", description: "The freelancer can now go live." });
  };

  const reject = async () => {
    if (!rejectId) return;
    const res = await fetch(`/api/admin/freelancers/${rejectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason: rejectReason }),
    });
    const json = await res.json();

    if (!res.ok) {
      toast({
        variant: "destructive",
        title: "Reject failed",
        description: json?.message || "Unable to reject profile.",
      });
      return;
    }

    setList(prev =>
      prev.map(p => (p._id === rejectId ? { ...p, approvalStatus: "rejected", rejectionReason: rejectReason } : p))
    );
    setRejectId(null);
    setRejectReason("");
    toast({ title: "Profile rejected", description: "Your reason has been saved." });
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/freelancers/${id}`, { method: "DELETE" });
    const json = await res.json();

    if (!res.ok) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: json?.message || "Unable to delete profile.",
      });
      return;
    }

    setList(prev => prev.filter(p => p._id !== id));
    toast({ title: "Profile deleted", description: "The profile has been removed permanently." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Freelancers</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, category"
              className="rounded-xl border border-slate-300 bg-white px-9 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
              onKeyDown={(e) => e.key === "Enter" && reload()}
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
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={reload}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Freelancer</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Portfolio</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No freelancers found.
                </td>
              </tr>
            )}
            <AnimatePresence initial={false}>
              {filtered.map((p) => (
                <motion.tr
                  key={p._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="border-t border-slate-200"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.profilePicture || "/images/avatar-placeholder.png"}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="font-medium text-slate-900">{p.userName || "—"}</div>
                        <div className="text-xs text-slate-500">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800">{p.categoryLabel || "—"}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">
                      {(p.services || []).slice(0, 2).join(", ")}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.portfolioCount}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.approvalStatus} reason={p.rejectionReason || ""} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setViewId(p._id)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                        title="View profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {p.approvalStatus !== "approved" && (
                        <button
                          onClick={() => approve(p._id)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-700 hover:bg-emerald-100"
                          title="Approve"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}

                      {p.approvalStatus !== "rejected" && (
                        <button
                          onClick={() => setRejectId(p._id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-100"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete uses AlertDialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                            title="Delete"
                            onClick={() => setDeleteId(p._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this profile?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the freelancer’s profile.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => {
                                if (deleteId) remove(deleteId);
                                setDeleteId(null);
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* View Drawer */}
      <ProfileDrawer id={viewId} onClose={() => setViewId(null)} />

      {/* Reject Dialog (kept custom, but you can swap to shadcn Dialog if you prefer) */}
      <RejectDialog
        open={!!rejectId}
        reason={rejectReason}
        onChangeReason={setRejectReason}
        onCancel={() => {
          setRejectId(null);
          setRejectReason("");
        }}
        onConfirm={reject}
      />
    </div>
  );
}

/* --- small parts --- */
function StatusBadge({
  status,
  reason,
}: {
  status: "pending" | "approved" | "rejected";
  reason?: string;
}) {
  if (status === "approved")
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
        Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span
        className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700 ring-1 ring-red-200"
        title={reason || ""}
      >
        Rejected
      </span>
    );
  return (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 ring-1 ring-amber-200">
      Pending
    </span>
  );
}

/* keep your existing RejectDialog/ProfileDrawer/computeProgress below */


function ProfileDrawer({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/freelancers/${id}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.message || "Failed");
        setP(j.profile);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  const progress = useMemo(() => computeProgress(p), [p]);

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl transform bg-white shadow-2xl transition-transform ${
        id ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Freelancer profile
        </h3>
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Close
        </button>
      </div>
      <div className="h-[calc(100dvh-64px)] overflow-y-auto p-5">
        {loading && <div className="text-sm text-slate-500">Loading…</div>}
        {!loading && p && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.profilePicture || "/images/avatar-placeholder.png"}
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div>
                <div className="text-lg font-semibold">
                  {p.user?.userName || "—"}
                </div>
                <div className="text-sm text-slate-500">{p.user?.email}</div>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Profile progress
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {progress}% complete
              </div>
            </div>

            <Info label="Category" value={p.categoryLabel || "—"} />
            <Info label="Location" value={p.location || "—"} />
            <Info label="Status" value={p.approvalStatus} />
            {p.approvalStatus === "rejected" && (
              <Info label="Rejection reason" value={p.rejectionReason || "—"} />
            )}

            {p.bio && (
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Bio
                </div>
                <p className="mt-1 text-sm text-slate-700">{p.bio}</p>
              </div>
            )}

            {(p.services?.length || 0) > 0 && (
              <ListBlock title="Services" items={p.services} />
            )}
            {(p.skills?.length || 0) > 0 && (
              <ListBlock title="Skills" items={p.skills} />
            )}

            {Array.isArray(p.ratePlans) && p.ratePlans.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Packages
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {p.ratePlans.map((rp: any) => (
                    <div
                      key={rp.type}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center"
                    >
                      <div className="text-[11px] text-slate-600">
                        {rp.type}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {rp.price > 0 ? `$${rp.price}` : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
  <div className="text-xs uppercase tracking-wide text-slate-500">
    Portfolio
  </div>

  {p.portfolio?.length ? (
    <Carousel className="mt-2 w-full" opts={{ align: "start", loop: true }}>
      <CarouselContent>
        {p.portfolio.map((it: any, idx: number) => (
          <CarouselItem key={`${it?.title ?? "item"}-${idx}`} className="md:basis-1/2">
            <div className="h-full rounded-xl border border-slate-200 p-3">
              {it?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.imageUrl}
                  alt={it?.title || `Portfolio item ${idx + 1}`}
                  className="mb-2 h-44 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="mb-2 flex h-44 w-full items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  No image
                </div>
              )}

              <div className="font-medium text-slate-900 line-clamp-1">
                {it?.title || "Untitled project"}
              </div>
              {it?.description && (
                <div className="text-sm text-slate-600 line-clamp-3">
                  {it.description}
                </div>
              )}

              {it?.projectUrl && (
                <a
                  className="mt-2 inline-block text-xs text-emerald-700 underline"
                  href={it.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View project
                </a>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Controls pinned below so they don't overlap content */}
      <div className="mt-3 flex items-center justify-end gap-2">
        <CarouselPrevious className="static translate-x-0 translate-y-0" />
        <CarouselNext className="static translate-x-0 translate-y-0" />
      </div>
    </Carousel>
  ) : (
    <div className="mt-1 text-sm text-slate-500">No portfolio items.</div>
  )}
</div>

          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-2 text-sm">
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-800">{value}</div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {title}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((s) => (
          <span
            key={s}
            className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// naive completeness calculation (front-end)
function computeProgress(p: any): number {
  if (!p) return 0;
  const checks = [
    !!p.profilePicture,
    !!p.bio && p.bio.length > 30,
    !!p.category,
    Array.isArray(p.skills) && p.skills.length >= 3,
    Array.isArray(p.services) && p.services.length >= 3,
    Array.isArray(p.ratePlans) && p.ratePlans.some((r: any) => r.price > 0),
    Array.isArray(p.portfolio) && p.portfolio.length >= 1,
    !!p.aboutThisGig && p.aboutThisGig.length > 50,
  ];
  const score = checks.filter(Boolean).length;
  return Math.round((score / checks.length) * 100);
}

function RejectDialog({
  open,
  reason,
  onChangeReason,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  reason: string;
  onChangeReason: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Reject profile</h3>
        <p className="mt-1 text-sm text-slate-600">
          Add an optional reason. The freelancer may see this.
        </p>
        <textarea
          className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
          rows={4}
          placeholder="Reason for rejection (optional)"
          value={reason}
          onChange={(e) => onChangeReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}