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
import { Badge } from "@/components/ui/badge"; // optional; remove if you don't have it
import { MessageSquare, ShieldCheck, MapPin, Sparkles } from "lucide-react";

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

              {/* Fiverr-like CTA Row */}
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

              {/* ===== Packages (Modern cards + Purchase) ===== */}
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
                            asChild
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Link
                              href={`/client/messages?to=${encodeURIComponent(
                                p.userName
                              )}&plan=${encodeURIComponent(rp.type)}`}
                            >
                              Purchase
                            </Link>
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

              {/* ===== Portfolio (shadcn Carousel) ===== */}
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

          {/* ===== RIGHT COLUMN (sticky) ===== */}
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

            {/* (Removed Social section per your request) */}
          </aside>
        </div>
      )}
    </div>
  );
}
