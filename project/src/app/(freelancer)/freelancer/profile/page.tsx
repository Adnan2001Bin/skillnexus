// src/app/(freelancer)/freelancer/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Pencil,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
} from "lucide-react";
import Image from "next/image";
import { Images } from "@/lib/images";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
  role: "freelancer" | "client" | "admin";
  isVerified: boolean;

  profilePicture?: string | null;
  location?: string | null;
  bio?: string | null;
  category?: string | null;
  categoryLabel?: string | null;
  services?: string[];
  skills?: string[];
  portfolio?: PortfolioItem[];
  ratePlans?: RatePlan[];
  aboutThisGig?: string | null;
  whatIOffer?: string[];
  socialLinks?: { platform: string; url: string }[];
  languageProficiency?: string[];

  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  reviewedAt?: string | null;

  createdAt: string;
  updatedAt: string;
};

export default function FreelancerProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [p, setP] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const editHref = useMemo(() => {
    const email = encodeURIComponent((session?.user as any)?.email || "");
    const userName = encodeURIComponent((session?.user as any)?.userName || "");
    return `/onboarding/freelancer?email=${email}&user=${userName}`;
  }, [session?.user]);

  const progress = useMemo(() => computeProgress(p), [p]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // FIX: point to /api/freelancer/me
        const res = await fetch("/api/freelancer/profile", {
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
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <Link
          href={editHref}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
        >
          <Pencil className="h-4 w-4" />
          Edit profile
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

      {/* Banners for moderation status */}
      {!loading && p?.approvalStatus === "rejected" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <XCircle className="mt-0.5 h-5 w-5" />
          <div>
            <div className="font-semibold">Your profile was rejected</div>
            {p.rejectionReason ? (
              <div className="mt-1 whitespace-pre-wrap">
                {p.rejectionReason}
              </div>
            ) : (
              <div className="mt-1">No reason provided.</div>
            )}
            {p.reviewedAt && (
              <div className="mt-1 text-xs text-red-700/80">
                Reviewed: {new Date(p.reviewedAt).toLocaleString()}
              </div>
            )}
            <div className="mt-2">
              <Link
                href={editHref}
                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Update & resubmit
              </Link>
            </div>
          </div>
        </div>
      )}

      {!loading && p?.approvalStatus === "pending" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Clock className="mt-0.5 h-5 w-5" />
          <div>
            <div className="font-semibold">Your profile is under review</div>
            <div className="mt-1">
              You can still edit details while you wait.
            </div>
            <div className="mt-2">
              <Link
                href={editHref}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {!loading && p && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          {/* Header strip */}
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-emerald-200">
                {p.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.profilePicture}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                    <Image
                      src={Images.logo}
                      alt="Logo"
                      width={28}
                      height={28}
                    />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold text-slate-900">
                    {p.userName}
                  </h2>
                  <StatusBadge
                    status={p.approvalStatus}
                    reason={p.rejectionReason || ""}
                  />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  {p.categoryLabel && <span>{p.categoryLabel}</span>}
                  {p.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {p.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-5">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Profile completeness
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
          </div>

          {/* Main content */}
          <div className="grid gap-6 p-6 md:grid-cols-[2fr_1fr]">
            {/* Left column */}
            <div className="space-y-6">
              {/* REJECTION DETAILS block inside the card too (optional, keeps UX consistent) */}
              {p.approvalStatus === "rejected" && (
                <Block title="Rejection details">
                  <div className="flex items-start gap-3 text-sm">
                    <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div>
                      {p.rejectionReason ? (
                        <div className="whitespace-pre-wrap text-red-800">
                          {p.rejectionReason}
                        </div>
                      ) : (
                        <div className="text-red-800">No reason provided.</div>
                      )}
                      {p.reviewedAt && (
                        <div className="mt-1 text-xs text-red-700/80">
                          Reviewed: {new Date(p.reviewedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Block>
              )}

              {p.bio && (
                <Block title="About me">
                  <p className="text-sm text-slate-700">{p.bio}</p>
                </Block>
              )}

              {(p.whatIOffer?.length ?? 0) > 0 && (
                <Block title="What I offer">
                  <Tags items={p.whatIOffer!} />
                </Block>
              )}

              {(p.skills?.length ?? 0) > 0 && (
                <Block title="Skills">
                  <Tags items={p.skills!} />
                </Block>
              )}

              {(p.services?.length ?? 0) > 0 && (
                <Block title="Services">
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {p.services!.map((svc) => (
                      <li key={svc}>{svc}</li>
                    ))}
                  </ul>
                </Block>
              )}

              {Array.isArray(p.ratePlans) && p.ratePlans.length > 0 && (
                <Block title="Packages">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {p.ratePlans!.map((rp) => (
                      <div
                        key={rp.type}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center"
                      >
                        <div className="text-xs text-slate-600">{rp.type}</div>
                        <div className="mt-0.5 text-base font-semibold text-slate-900">
                          {rp.price > 0 ? `$${rp.price}` : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </Block>
              )}

              {p.aboutThisGig && (
                <Block title="About this gig">
                  <p className="text-sm text-slate-700">{p.aboutThisGig}</p>
                </Block>
              )}

              {/* Portfolio */}
              <Block title="Portfolio">
                {p.portfolio?.length ? (
                  <Carousel
                    className="w-full"
                    opts={{ align: "start", loop: true }}
                    aria-label="Portfolio items"
                  >
                    <CarouselContent>
                      {p.portfolio!.map((it, idx) => (
                        <CarouselItem
                          key={`${it.title}-${idx}`}
                          className="md:basis-1/2 lg:basis-1/3"
                        >
                          <div className="rounded-xl border border-slate-200 p-3 h-full flex flex-col">
                            {it.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={it.imageUrl}
                                alt={it.title || `Portfolio item ${idx + 1}`}
                                className="mb-2 h-44 w-full rounded-lg object-cover"
                              />
                            ) : (
                              <div className="mb-2 flex h-44 w-full items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                No image
                              </div>
                            )}

                            <div className="font-medium text-slate-900 line-clamp-1">
                              {it.title}
                            </div>
                            <div className="text-sm text-slate-600 line-clamp-3">
                              {it.description}
                            </div>

                            {it.projectUrl && (
                              <a
                                href={it.projectUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-block text-xs text-emerald-700 underline"
                              >
                                View project
                              </a>
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    {/* Controls */}
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <CarouselPrevious className="static translate-x-0 translate-y-0" />
                      <CarouselNext className="static translate-x-0 translate-y-0" />
                    </div>
                  </Carousel>
                ) : (
                  <div className="text-sm text-slate-500">
                    No portfolio items yet.
                  </div>
                )}
              </Block>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {(p.languageProficiency?.length ?? 0) > 0 && (
                <Block title="Languages">
                  <Tags items={p.languageProficiency!} />
                </Block>
              )}

              {(p.socialLinks?.length ?? 0) > 0 && (
                <Block title="Social links">
                  <ul className="space-y-2 text-sm">
                    {p.socialLinks!.map((s, i) => (
                      <li key={`${s.platform}-${i}`}>
                        <span className="text-slate-600">{s.platform}:</span>{" "}
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-emerald-700 underline"
                        >
                          {s.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Block>
              )}

              <Block title="Account">
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-slate-500">Email:</span> {p.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Verification:</span>
                    {p.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <Clock className="h-4 w-4" /> Not verified
                      </span>
                    )}
                  </div>
                  {p.approvalStatus !== "approved" && (
                    <div className="mt-2 inline-flex items-start gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                      <Info className="mt-0.5 h-4 w-4" />
                      You can update your profile anytime using the “Edit
                      profile” button above.
                    </div>
                  )}
                </div>
              </Block>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* helpers & tiny components */

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {items.map((t) => (
        <span
          key={t}
          className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

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

function computeProgress(p: Profile | null): number {
  if (!p) return 0;
  const checks = [
    !!p.profilePicture,
    !!p.bio && p.bio.length > 30,
    !!p.category,
    Array.isArray(p.skills) && p.skills.length >= 3,
    Array.isArray(p.services) && p.services.length >= 3,
    Array.isArray(p.ratePlans) && p.ratePlans.some((r) => r.price > 0),
    Array.isArray(p.portfolio) && p.portfolio.length >= 1,
    !!p.aboutThisGig && p.aboutThisGig.length > 50,
  ];
  const score = checks.filter(Boolean).length;
  return Math.round((score / checks.length) * 100);
}
