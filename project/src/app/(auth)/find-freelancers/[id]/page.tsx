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
import { MessageSquare, ShieldCheck, MapPin, Sparkles, X } from "lucide-react";

type RatePlan = {
  type: "Basic" | "Standard" | "Premium";
  price: number;
  description?: string;
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

export default function PublicFreelancerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [p, setP] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // NEW: purchase state
  const [purchasePlan, setPurchasePlan] = useState<RatePlan | null>(null);

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

  const firstName = (p?.userName || "Freelancer").split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 font-sans">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Freelancer</h1>
        <Link
          href="/find-freelancers"
          className="text-sm text-emerald-700 underline"
        >
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
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && p && (
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          {/* LEFT */}
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
                    <span className="truncate text-lg font-semibold text-slate-900">
                      {p.userName}
                    </span>
                    <span className="hidden text-slate-400 md:inline">·</span>
                    {p.categoryLabel ? (
                      <span className="truncate text-sm text-slate-600">
                        {p.categoryLabel}
                      </span>
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
                <div className="ml-auto hidden items-end justify-end text-right md:flex">
                  {minPrice !== null && (
                    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm ring-1 ring-emerald-200">
                      <div className="text-slate-600">Starting at</div>
                      <div className="font-semibold text-slate-900">
                        ${minPrice}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-600 hover:bg-emerald-600">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Top Rated Services
                </Badge>
                {p.languageProficiency?.length ? (
                  <div className="text-xs text-slate-600">
                    Languages: {p.languageProficiency.join(", ")}
                  </div>
                ) : null}
                <div className="ml-auto">
                  <Button asChild>
                    <Link
                      href={`/client/messages?to=${encodeURIComponent(
                        p.userName
                      )}`}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message {firstName}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-8 p-6">
              {p.bio && (
                <section>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    About
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{p.bio}</p>
                </section>
              )}

              {p.aboutThisGig && (
                <section>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    About this gig
                  </div>
                  <p className="mt-1 text-sm text-slate-700">
                    {p.aboutThisGig}
                  </p>
                </section>
              )}

              {(p.whatIOffer?.length ?? 0) > 0 && (
                <section>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    What I offer
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
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Skills
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
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Services
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {p.services!.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ===== Packages (updated buttons) ===== */}
              {Array.isArray(p.ratePlans) && p.ratePlans.length > 0 && (
                <section>
                  <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">
                    Packages
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {p.ratePlans!.map((rp) => (
                      <div
                        key={rp.type}
                        className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/40 p-5 shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-md hover:ring-emerald-200"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                              {rp.type}
                            </div>
                            <div className="mt-1 text-2xl font-bold text-slate-900">
                              {rp.price > 0 ? `$${rp.price}` : "—"}
                              {rp.price > 0 && (
                                <span className="ml-1 text-xs font-medium text-slate-500">
                                  /project
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                            Popular
                          </Badge>
                        </div>

                        {rp.description && (
                          <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                            {rp.description}
                          </p>
                        )}

                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => setPurchasePlan(rp)}
                            disabled={rp.price <= 0}
                          >
                            Purchase
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Link
                              href={`/client/messages?to=${encodeURIComponent(
                                p.userName
                              )}&plan=${encodeURIComponent(
                                rp.type
                              )}&type=custom-offer`}
                            >
                              Custom offer
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ===== Portfolio ===== */}
              <section>
                <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">
                  Portfolio
                </div>

                {p.portfolio?.length ? (
                  <div className="relative">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {p.portfolio!.map((it, idx) => (
                          <CarouselItem
                            key={`${it.title}-${idx}`}
                            className="md:basis-1/2 lg:basis-1/3"
                          >
                            <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
                              {it.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={it.imageUrl}
                                  alt={it.title}
                                  className="h-48 w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-48 w-full items-center justify-center bg-slate-50 text-slate-400">
                                  No image
                                </div>
                              )}
                              <div className="p-3">
                                <div className="truncate font-medium text-slate-900">
                                  {it.title}
                                </div>
                                <div className="line-clamp-2 text-sm text-slate-600">
                                  {it.description}
                                </div>
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
                  <div className="mt-2 text-sm text-slate-500">
                    No portfolio items.
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* RIGHT column unchanged */}
          <aside className="space-y-4 md:sticky md:top-4">
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-white to-emerald-50/40 p-5 shadow-sm">
              {minPrice !== null && (
                <div className="mb-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Starting at
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    ${minPrice}
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-600">
                Have questions or need a custom package? Send a message to{" "}
                <span className="font-medium text-slate-800">{firstName}</span>.
              </p>

              <div className="mt-3 flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link
                    href={`/client/messages?to=${encodeURIComponent(
                      p.userName
                    )}`}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message {firstName}
                  </Link>
                </Button>
                {p.ratePlans?.[0] && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Link
                      href={`/client/messages?to=${encodeURIComponent(
                        p.userName
                      )}&plan=${encodeURIComponent(p.ratePlans[0].type)}`}
                    >
                      Continue with {p.ratePlans[0].type}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* NEW: Purchase Drawer */}
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

/* ================= Purchase Flow Drawer ================= */

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
  const [status, setStatus] = useState<{ payment: "unpaid" | "paid"; project: "pending" | "approved" | "cancelled" }>({
    payment: "unpaid",
    project: "pending",
  });

  // local answers state
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const createOrder = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/client/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freelancerId,
          planType: plan.type,
          // clientEmail: "demo@example.com", // optional
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to create order");
      setOrderId(json.order.id);
      setStatus((s) => ({ ...s, payment: json.order.paymentStatus, project: json.order.projectStatus }));
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
      // demo card form could be validated here; we skip that
      const res = await fetch(`/api/client/orders/${orderId}/pay`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Payment failed");

      // fetch order to get requirements snapshot
      const getRes = await fetch(`/api/client/orders/${orderId}`);
      const getJson = await getRes.json();
      if (!getRes.ok) throw new Error(getJson?.message || "Failed to load order");
      setRequirements(getJson.order.requirementsSnapshot || []);
      setStatus((s) => ({ ...s, payment: "paid" }));
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
          else if (Array.isArray(v) && v.every((x) => x && typeof x.name === "string")) a.files = v;
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

  /** Render fields according to requirement type (demo uploader keeps only name/size) */
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
              rows={4}
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
      const files: { name: string; size?: number }[] = answers[r.id] || [];
      const onFiles = (list: FileList | null) => {
        if (!list) return;
        const arr = Array.from(list).map((f) => ({ name: f.name, size: f.size }));
        setAnswers((s) => ({ ...s, [r.id]: arr }));
      };
      return (
        <div>
          <label className="text-sm font-medium text-slate-800">
            {r.question} {r.required && <span className="text-red-600">*</span>}
          </label>
          {r.helperText && <div className="text-xs text-slate-500">{r.helperText}</div>}
          <input
            type="file"
            multiple={!!(r.maxFiles && r.maxFiles > 1)}
            accept={r.accepts?.join(",") || undefined}
            onChange={(e) => onFiles(e.target.files)}
            className="mt-1 block w-full text-sm"
          />
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`}>• {f.name}{typeof f.size === "number" ? ` (${Math.round(f.size/1024)}KB)` : ""}</li>
              ))}
            </ul>
          )}
          <div className="mt-1 text-xs text-slate-500">
            Accepts: {(r.accepts || []).length ? r.accepts!.join(", ") : "any"} • Max files:{" "}
            {r.maxFiles || 1}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 p-0 md:p-6">
      <div className="relative w-full max-w-2xl rounded-t-2xl md:rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="font-semibold text-slate-900">
            {step === "checkout" && "Checkout"}
            {step === "payment" && "Payment (Demo)"}
            {step === "requirements" && "Requirements"}
            {step === "done" && "Order submitted"}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {/* Stepper */}
          <div className="mb-4 flex items-center gap-2 text-xs">
            <StepBubble active={step === "checkout"} done={["payment","requirements","done"].includes(step)}>
              1
            </StepBubble>
            <div className="h-px flex-1 bg-slate-200" />
            <StepBubble active={step === "payment"} done={["requirements","done"].includes(step)}>
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
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>Subtotal</div>
                  <div className="font-semibold">${plan.price}</div>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div>Fees</div>
                  <div>$0.00</div>
                </div>
                <div className="mt-2 border-t border-emerald-200 pt-2 flex items-center justify-between">
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
              {requirements.length === 0 ? (
                <div className="text-sm text-slate-600">
                  No requirements were provided by the freelancer. You can continue.
                </div>
              ) : (
                requirements.map((r) => (
                  <div key={r.id} className="rounded-xl border border-slate-200 p-3">
                    {renderRequirement(r)}
                  </div>
                ))
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStep("payment")} disabled={busy}>
                  Back
                </Button>
                <Button onClick={submitRequirements} disabled={busy}>
                  {busy ? "Submitting..." : "Submit & finish"}
                </Button>
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
                Thanks! The freelancer will review your requirements and proceed. You’ll be notified once the project is approved or if more info is needed.
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

function StepBubble({ active, done, children }: { active: boolean; done: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
        active ? "bg-emerald-600 text-white"
        : done ? "bg-emerald-100 text-emerald-700"
        : "bg-slate-100 text-slate-600"
      }`}
    >
      {children}
    </div>
  );
}
