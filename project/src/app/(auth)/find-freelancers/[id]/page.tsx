// src/app/find-freelancers/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ShieldCheck,
  MapPin,
  Sparkles,
  X,
  PackageCheck,
  CheckCircle2,
  Clock,
  Repeat2,
  Info,
  FolderGit2,
} from "lucide-react";
import { UTFileUploader } from "@/components/client/UTFileUploader";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

/* ================= Types ================= */

type RatePlan = {
  type: "Basic" | "Standard" | "Premium";
  price: number;
  description: string;
  whatsIncluded: string[];
  deliveryDays: number;
  revisions: number;
};

type PortfolioItem = {
  title: string;
  description: string;
  imageUrl?: string | null;
  projectUrl?: string | null;
};

type Requirement =
  | {
      id: string;
      type: "text" | "textarea";
      question: string;
      helperText?: string;
      required?: boolean;
    }
  | {
      id: string;
      type: "multiple_choice";
      question: string;
      helperText?: string;
      required?: boolean;
      options: string[];
      allowMultiple?: boolean;
    }
  | {
      id: string;
      type: "file";
      question: string;
      helperText?: string;
      required?: boolean;
      accepts?: string[];
      maxFiles?: number | null;
    }
  | {
      id: string;
      type: "instructions";
      content: string;
    };

type Profile = {
  _id: string;
  userName: string;
  email: string;
  profilePicture?: string | null;
  bio?: string | null;
  location?: string | null;
  category?: string | null;
  categoryLabel?: string | null;
  services?: string[];
  skills?: string[];
  portfolio?: PortfolioItem[];
  ratePlans?: RatePlan[];
  aboutThisGig?: string | null;
  whatIOffer?: string[];
  languageProficiency?: string[];
  createdAt: string;
  updatedAt: string;
};

/* ================= Page ================= */

export default function PublicFreelancerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [p, setP] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Purchase drawer state
  const [purchasePlan, setPurchasePlan] = useState<RatePlan | null>(null);

  // Active order lock — only for the plan that's active
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [activeOrderStatus, setActiveOrderStatus] = useState<string | null>(null);
  const [activePlanType, setActivePlanType] = useState<"Basic" | "Standard" | "Premium" | null>(null);

  const minPrice = useMemo(() => {
    if (!p?.ratePlans?.length) return null;
    const prices = p.ratePlans.map((r) => Number(r.price || 0));
    const m = Math.min(...prices);
    return Number.isFinite(m) ? m : null;
  }, [p]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/client/freelancers/${id}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to load profile");
        if (mounted) setP(json.profile);
      } catch (e: any) {
        if (mounted) setError(e.message || "Error loading profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Check if this client already has an active order with this freelancer (and which plan)
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/client/orders/active?freelancerId=${id}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to check orders");
        if (!mounted) return;
        setHasActiveOrder(!!json.active);
        setActiveOrderStatus(json?.order?.projectStatus ?? null);
        setActivePlanType(json?.order?.planType ?? null);
      } catch {
        // Fail-open: allow purchase if the check fails
        if (!mounted) return;
        setHasActiveOrder(false);
        setActiveOrderStatus(null);
        setActivePlanType(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const firstName = (p?.userName || "Freelancer").split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-900">Freelancer</h1>
        </div>
        <Link href="/find-freelancers" className="text-sm text-emerald-700 underline">
          ← Back to list
        </Link>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 h-64 w-full animate-pulse rounded-lg bg-slate-100" />
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && p && (
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          {/* ===== LEFT COLUMN ===== */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {/* Header */}
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.profilePicture || "/images/avatar-placeholder.png"}
                  alt={p.userName}
                  className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-lg font-semibold text-slate-900">{p.userName}</span>
                    <span className="hidden text-slate-400 md:inline">·</span>
                    {p.categoryLabel ? (
                      <span className="truncate text-sm text-slate-600">{p.categoryLabel}</span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    {p.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {p.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Verified Freelancer
                    </span>
                  </div>
                </div>
                {/* removed "Starting at" as requested */}
              </div>

              {/* CTA Row */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-600 hover:bg-emerald-600">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Top Rated Services
                </Badge>
                {p.languageProficiency?.length ? (
                  <div className="text-xs text-slate-600">Languages: {p.languageProficiency.join(", ")}</div>
                ) : null}
                <div className="ml-auto">
                  <Button asChild>
                    <Link href={`/client/messages?to=${encodeURIComponent(p.userName)}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message {firstName}
                    </Link>
                  </Button>
                </div>
              </div>

              {hasActiveOrder && activePlanType && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4" />
                    <div>
                      You already have an active <b>{activePlanType}</b> order with {firstName}
                      {activeOrderStatus ? (
                        <>
                          {" "}
                          (status: <b className="capitalize">{activeOrderStatus}</b>)
                        </>
                      ) : null}
                      . You can still purchase other packages.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="space-y-8 p-6">
              {p.bio && (
                <section>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <FolderGit2 className="h-4 w-4" /> About
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{p.bio}</p>
                </section>
              )}

              {p.aboutThisGig && (
                <section>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <PackageCheck className="h-4 w-4" /> About this gig
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{p.aboutThisGig}</p>
                </section>
              )}

              {(p.whatIOffer?.length ?? 0) > 0 && (
                <section>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <CheckCircle2 className="h-4 w-4" /> What I offer
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.whatIOffer!.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {(p.skills?.length ?? 0) > 0 && (
                <section>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <Sparkles className="h-4 w-4" /> Skills
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.skills!.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-700 ring-1 ring-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {(p.services?.length ?? 0) > 0 && (
                <section>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <PackageCheck className="h-4 w-4" /> Services
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {p.services!.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ===== Portfolio ===== */}
              <section>
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                  <FolderGit2 className="h-4 w-4" />
                  Portfolio
                </div>

                {p.portfolio?.length ? (
                  <div className="relative">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {p.portfolio!.map((it, idx) => (
                          <CarouselItem key={`${it.title}-${idx}`} className="md:basis-1/2 lg:basis-1/3">
                            <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
                              {it.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={it.imageUrl} alt={it.title} className="h-48 w-full object-cover" />
                              ) : (
                                <div className="flex h-48 w-full items-center justify-center bg-slate-50 text-slate-400">
                                  No image
                                </div>
                              )}
                              <div className="p-3">
                                <div className="truncate font-medium text-slate-900">{it.title}</div>
                                <div className="line-clamp-2 text-sm text-slate-600">{it.description}</div>
                                {it.projectUrl && (
                                  <a
                                    href={it.projectUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 inline-block text-xs text-emerald-700 underline"
                                  >
                                    View project
                                  </a>
                                )}
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>

                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </Carousel>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">No portfolio items.</div>
                )}
              </section>
            </div>
          </div>

          {/* ===== RIGHT COLUMN (sticky) — Packages in Tabs ===== */}
          <aside className="space-y-4 md:sticky md:top-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-semibold text-slate-900">Packages</h2>
              </div>

              {Array.isArray(p.ratePlans) && p.ratePlans.length > 0 ? (
                <Tabs defaultValue={p.ratePlans[0]?.type || "Basic"} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="Basic">Basic</TabsTrigger>
                    <TabsTrigger value="Standard">Standard</TabsTrigger>
                    <TabsTrigger value="Premium">Premium</TabsTrigger>
                  </TabsList>

                  {p.ratePlans.map((rp) => {
                    const isLocked = hasActiveOrder && activePlanType === rp.type;
                    return (
                      <TabsContent key={rp.type} value={rp.type} className="mt-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{rp.type}</div>
                              <div className="mt-1 text-2xl font-bold text-slate-900">
                                ${rp.price}
                                <span className="ml-1 text-xs font-medium text-slate-500">/project</span>
                              </div>
                            </div>
                            <Badge className="bg-slate-100 text-slate-700 ring-1 ring-slate-200">Popular</Badge>
                          </div>

                          {rp.description && (
                            <p className="mt-3 text-sm leading-relaxed text-slate-700">{rp.description}</p>
                          )}

                          <div className="mt-4 grid gap-2 text-sm">
                            <div className="inline-flex items-center gap-2 text-slate-700">
                              <Clock className="h-4 w-4" />
                              Delivery: <span className="font-medium">{rp.deliveryDays} days</span>
                            </div>
                            <div className="inline-flex items-center gap-2 text-slate-700">
                              <Repeat2 className="h-4 w-4" />
                              Revisions: <span className="font-medium">{rp.revisions}</span>
                            </div>
                          </div>

                          {rp.whatsIncluded?.length ? (
                            <div className="mt-4">
                              <div className="text-xs uppercase tracking-wide text-slate-500">What’s included</div>
                              <ul className="mt-2 space-y-1.5">
                                {rp.whatsIncluded.map((item, i) => (
                                  <li key={`${item}-${i}`} className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          <div className="mt-5 flex flex-col gap-2">
                            <Button
                              className="w-full"
                              onClick={() => setPurchasePlan(rp)}
                              disabled={isLocked}
                            >
                              {isLocked ? `Purchase (locked)` : `Purchase ${rp.type}`}
                            </Button>

                            <Button
                              asChild
                              variant="outline"
                              className="w-full"
                              disabled={isLocked}
                            >
                              <Link
                                href={`/client/messages?to=${encodeURIComponent(
                                  p.userName
                                )}&plan=${encodeURIComponent(rp.type)}&type=custom-offer`}
                              >
                                Ask for a custom offer
                              </Link>
                            </Button>

                            {isLocked && (
                              <div className="text-[11px] text-slate-500">
                                You have an active {rp.type} project with {firstName}. Finish it to purchase {rp.type} again.
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              ) : (
                <div className="text-sm text-slate-600">No packages available.</div>
              )}

              {/* Messaging button under tabs (always enabled) */}
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/client/messages?to=${encodeURIComponent(p.userName)}`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message {firstName}
                  </Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ===== Purchase Drawer ===== */}
      {p && purchasePlan && (
        <PurchaseFlow
          freelancerId={p._id}
          freelancerName={p.userName}
          plan={purchasePlan}
          onClose={() => setPurchasePlan(null)}
        />
      )}
    </div>
  );
}

/* =============== Purchase Flow Drawer (compact requirements wizard) =============== */

function PurchaseFlow({
  freelancerId,
  freelancerName,
  plan,
  onClose,
}: {
  freelancerId: string;
  freelancerName: string;
  plan: { type: "Basic" | "Standard" | "Premium"; price: number };
  onClose: () => void;
}) {
  const [step, setStep] = useState<"checkout" | "payment" | "requirements" | "done">("checkout");
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [status, setStatus] = useState<{
    payment: "unpaid" | "paid";
    project: "pending" | "approved" | "cancelled";
  }>({
    payment: "unpaid",
    project: "pending",
  });

  // local answers + wizard index
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [reqIndex, setReqIndex] = useState(0);

  const totalReqs = requirements.length;
  const currentReq = requirements[reqIndex];

  const progressPct = useMemo(() => {
    if (!totalReqs) return 0;
    const answeredCount = requirements.reduce((acc, r) => {
      const v = (answers as any)[r.id];
      if (r.type === "instructions") return acc + 1;
      if (typeof v === "string" && v.trim()) return acc + 1;
      if (Array.isArray(v) && v.length > 0) return acc + 1;
      return acc;
    }, 0);
    return Math.round((answeredCount / totalReqs) * 100);
  }, [requirements, answers, totalReqs]);

  const createOrder = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/client/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freelancerId,
          planType: plan.type,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to create order");
      setOrderId(json.order.id);
      setStatus((s) => ({
        ...s,
        payment: json.order.paymentStatus,
        project: json.order.projectStatus,
      }));
      setStep("payment");
    } catch (e: any) {
      alert(e.message || "Could not create order");
    } finally {
      setBusy(false);
    }
  };

  const pay = async () => {
    if (!orderId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/client/orders/${orderId}/pay`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Payment failed");

      // fetch order to get requirements snapshot
      const getRes = await fetch(`/api/client/orders/${orderId}`);
      const getJson = await getRes.json();
      if (!getRes.ok) throw new Error(getJson?.message || "Failed to load order");
      setRequirements(getJson.order.requirementsSnapshot || []);
      setStatus((s) => ({ ...s, payment: "paid" }));
      setReqIndex(0);
      setStep("requirements");
    } catch (e: any) {
      alert(e.message || "Payment error");
    } finally {
      setBusy(false);
    }
  };

  const submitRequirements = async () => {
    if (!orderId) return;
    setBusy(true);
    try {
      // transform local `answers` into API shape
      const payload = {
        answers: Object.entries(answers).map(([id, v]) => {
          const a: any = { id };
          if (typeof v === "string") a.text = v;
          else if (Array.isArray(v) && v.every((x) => typeof x === "string")) a.options = v;
          else if (Array.isArray(v) && v.every((x) => x && typeof x.url === "string")) a.files = v; // {name, size, url}
          return a;
        }),
      };

      const res = await fetch(`/api/client/orders/${orderId}/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Submit failed");
      setStatus({ payment: "paid", project: "pending" });
      setStep("done");
    } catch (e: any) {
      alert(e.message || "Could not submit requirements");
    } finally {
      setBusy(false);
    }
  };

  /* ---------- Compact requirement renderer (single card wizard) ---------- */
  const renderRequirement = (r: Requirement) => {
    if (r.type === "instructions") {
      return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">
          {r.content}
        </div>
      );
    }
    if (r.type === "text" || r.type === "textarea") {
      return (
        <div>
          <label className="text-sm font-medium text-slate-800">
            {r.question} {r.required && <span className="text-red-600">*</span>}
          </label>
          {r.helperText && <div className="text-xs text-slate-500">{r.helperText}</div>}
          {r.type === "text" ? (
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
              value={answers[r.id] || ""}
              onChange={(e) => setAnswers((s) => ({ ...s, [r.id]: e.target.value }))}
            />
          ) : (
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
              rows={5}
              value={answers[r.id] || ""}
              onChange={(e) => setAnswers((s) => ({ ...s, [r.id]: e.target.value }))}
            />
          )}
        </div>
      );
    }
    if (r.type === "multiple_choice") {
      const selected: string[] = answers[r.id] || [];
      const toggle = (opt: string) => {
        setAnswers((s) => {
          const curr: string[] = s[r.id] || [];
          if (r.allowMultiple) {
            return curr.includes(opt)
              ? { ...s, [r.id]: curr.filter((x) => x !== opt) }
              : { ...s, [r.id]: [...curr, opt] };
          }
          return { ...s, [r.id]: curr.includes(opt) ? [] : [opt] };
        });
      };
      return (
        <div>
          <label className="text-sm font-medium text-slate-800">
            {r.question} {r.required && <span className="text-red-600">*</span>}
          </label>
          {r.helperText && <div className="text-xs text-slate-500">{r.helperText}</div>}
          <div className="mt-2 flex flex-wrap gap-2">
            {r.options.map((opt) => {
              const active = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`rounded-full px-3 py-1 text-sm ring-1 transition ${
                    active
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {r.allowMultiple ? "Multiple selections allowed" : "Single selection"}
          </div>
        </div>
      );
    }
    if (r.type === "file") {
      const current = (answers[r.id] || []) as { name: string; size?: number; url: string }[];
      return (
        <div>
          <label className="text-sm font-medium text-slate-800">
            {r.question} {r.required && <span className="text-red-600">*</span>}
          </label>
          {r.helperText && <div className="text-xs text-slate-500">{r.helperText}</div>}

          <div className="mt-2">
            <UTFileUploader
              maxFiles={r.maxFiles ?? 5}
              onChange={(uploaded: { name: string; size?: number; url: string }[]) =>
                setAnswers((s) => ({ ...s, [r.id]: uploaded }))
              }
              note={`Accepts: ${((r.accepts as string[] | undefined) ?? ["images and pdf"]).join(", ")} • Max files: ${
                r.maxFiles ?? 5
              }`}
            />
          </div>

          {current.length > 0 && (
            <ul className="mt-2 max-h-28 space-y-1 overflow-auto pr-1 text-sm text-slate-700">
              {current.map((f, i) => (
                <li key={`${f.url}-${i}`}>
                  • {f.name}
                  {typeof f.size === "number" ? ` (${Math.round(f.size / 1024)}KB)` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 md:items-center md:p-6">
      <div className="relative w-full max-w-2xl rounded-t-2xl border border-slate-200 bg-white shadow-2xl md:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="font-semibold text-slate-900">
            {step === "checkout" && "Checkout"}
            {step === "payment" && "Payment (Demo)"}
            {step === "requirements" && "Requirements"}
            {step === "done" && "Order submitted"}
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {/* Stepper */}
          <div className="mb-4 flex items-center gap-2 text-xs">
            <StepBubble active={step === "checkout"} done={["payment", "requirements", "done"].includes(step)}>
              1
            </StepBubble>
            <div className="h-px flex-1 bg-slate-200" />
            <StepBubble active={step === "payment"} done={["requirements", "done"].includes(step)}>
              2
            </StepBubble>
            <div className="h-px flex-1 bg-slate-200" />
            <StepBubble active={step === "requirements"} done={step === "done"}>
              3
            </StepBubble>
            <div className="h-px flex-1 bg-slate-200" />
            <StepBubble active={step === "done"} done={false}>
              4
            </StepBubble>
          </div>

          {/* Content */}
          {step === "checkout" && (
            <div className="space-y-3">
              <div className="text-sm text-slate-700">
                You’re buying <span className="font-semibold">{plan.type}</span> from{" "}
                <span className="font-semibold">{freelancerName}</span>.
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>Subtotal</div>
                  <div className="font-semibold">${plan.price}</div>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div>Fees</div>
                  <div>$0.00</div>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                  <div className="font-semibold">Total</div>
                  <div className="font-bold">${plan.price}</div>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                After payment you’ll fill the freelancer’s requirements form so they can start.
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={createOrder} disabled={busy}>
                  {busy ? "Processing..." : "Proceed to payment"}
                </Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-sm font-medium text-slate-800">Demo card</div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
                  <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="MM/YY" defaultValue="12/34" />
                  <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="CVC" defaultValue="123" />
                  <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Name on card" defaultValue="JOHN DEMO" />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div>Amount</div>
                  <div className="font-semibold">${plan.price}</div>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStep("checkout")} disabled={busy}>
                  Back
                </Button>
                <Button onClick={pay} disabled={busy || !orderId}>
                  {busy ? "Paying..." : "Pay now"}
                </Button>
              </div>
            </div>
          )}

          {step === "requirements" && (
            <div className="space-y-4">
              {/* Compact top summary + progress */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="text-slate-600">
                    Question {Math.min(reqIndex + 1, totalReqs)} of {totalReqs}
                  </div>
                  <div className="font-medium text-slate-700">{progressPct}% complete</div>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/70">
                  <div className="h-2 rounded-full bg-emerald-500 transition-[width]" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              {/* The single active requirement card */}
              {totalReqs === 0 ? (
                <div className="text-sm text-slate-600">
                  No requirements were provided by the freelancer. You can continue.
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 p-4">{currentReq && renderRequirement(currentReq)}</div>
              )}

              {/* Sticky-ish controls */}
              <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">{totalReqs > 0 && <>{reqIndex + 1}/{totalReqs}</>}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setStep("payment")} disabled={busy}>
                      Back
                    </Button>
                    {reqIndex > 0 && (
                      <Button variant="outline" onClick={() => setReqIndex((i) => Math.max(0, i - 1))} disabled={busy}>
                        Previous
                      </Button>
                    )}
                    {reqIndex < totalReqs - 1 && (
                      <Button onClick={() => setReqIndex((i) => Math.min(totalReqs - 1, i + 1))} disabled={busy || totalReqs === 0}>
                        Next
                      </Button>
                    )}
                    {reqIndex === totalReqs - 1 && (
                      <Button onClick={submitRequirements} disabled={busy}>
                        {busy ? "Submitting..." : "Submit & finish"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-slate-700">Payment</div>
                  <div className="font-semibold text-emerald-700">Paid</div>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-slate-700">Project status</div>
                  <div className="font-semibold text-amber-700">Pending approval</div>
                </div>
              </div>
              <div className="text-sm text-slate-700">
                Thanks! The freelancer will review your requirements and proceed. You’ll be notified once the project is
                approved or if more info is needed.
              </div>
              <div className="flex justify-end">
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =============== Small UI =============== */

function StepBubble({
  active,
  done,
  children,
}: {
  active: boolean;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
        active
          ? "bg-emerald-600 text-white"
          : done
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {children}
    </div>
  );
}
