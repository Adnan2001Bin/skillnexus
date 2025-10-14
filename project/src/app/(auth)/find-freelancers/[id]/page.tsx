"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  DollarSign,
  MapPin,
  Clock,
  RefreshCw,
  Check,
  PlayCircle,
  X,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Images } from "@/lib/images";

type RatePlan = {
  type: "Basic" | "Standard" | "Premium";
  price: number;
  description?: string;
  whatsIncluded?: string[];
  deliveryDays?: number;
  revisions?: number;
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
  bio?: string | null;
  profilePicture?: string | null;
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
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function PublicFreelancerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

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

  const startMessage = (pkg?: string) => {
    const to = encodeURIComponent(p?.userName || "");
    const qp = new URLSearchParams();
    qp.set("to", to);
    if (pkg) qp.set("package", pkg);
    router.push(`/client/messages?${qp.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cover */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={Images.coverimg}
          alt="Cover"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {/* Top bar */}
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/find-freelancers"
              className="text-sm text-primary underline hover:text-primary/80"
            >
              ← Back to Freelancers
            </Link>
          </div>

          {/* Fiverr-like primary Message CTA */}
          <Button
            onClick={() => startMessage()}
            className="h-9 rounded-full px-5"
          >
            Message
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-4 w-64 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 h-64 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Content */}
        {!loading && p && (
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            {/* LEFT */}
            <div className="space-y-6">
              {/* Header card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-primary/20">
                    <Image
                      src={p.profilePicture || "/images/avatar-placeholder.png"}
                      alt={p.userName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-xl font-semibold text-foreground">
                      {p.userName}
                    </h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{p.categoryLabel || "—"}</span>
                      {p.location && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> {p.location}
                          </span>
                        </>
                      )}
                    </div>

                    {minPrice !== null && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <DollarSign className="h-4 w-4" />
                        Starting at ${minPrice}
                      </div>
                    )}
                  </div>

                  {/* Secondary message button (desktop) */}
                  <Button
                    variant="outline"
                    className="hidden rounded-full sm:inline-flex"
                    onClick={() => startMessage()}
                  >
                    Message
                  </Button>
                </div>
              </motion.div>

              {/* PACKAGES — redesigned with CTAs */}
              {Array.isArray(p.ratePlans) && p.ratePlans.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                >
                  <h3 className="mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                    Packages
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {p.ratePlans.map((rp) => (
                      <Card
                        key={rp.type}
                        className="group relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-b from-white to-emerald-50"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="rounded-full">
                              {rp.type}
                            </Badge>
                            {typeof rp.deliveryDays === "number" && (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />{" "}
                                {rp.deliveryDays} day
                                {rp.deliveryDays !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <CardTitle className="mt-2 text-2xl font-bold">
                            {rp.price > 0 ? `$${rp.price}` : "—"}
                          </CardTitle>
                          {typeof rp.revisions === "number" && (
                            <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <RefreshCw className="h-3.5 w-3.5" />
                              {rp.revisions} revision
                              {rp.revisions !== 1 ? "s" : ""}
                            </div>
                          )}
                        </CardHeader>

                        <CardContent>
                          {rp.description && (
                            <>
                              <p className="text-sm text-muted-foreground">
                                {rp.description}
                              </p>
                              <Separator className="my-3" />
                            </>
                          )}

                          {rp.whatsIncluded?.length ? (
                            <ul className="space-y-1 text-sm">
                              {rp.whatsIncluded.slice(0, 6).map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          <Button
                            className="mt-4 w-full"
                            onClick={() => startMessage(rp.type)}
                          >
                            Continue
                          </Button>
                        </CardContent>

                        {/* subtle hover stripe */}
                        <div className="pointer-events-none absolute inset-x-0 -bottom-12 h-24 translate-y-0 bg-gradient-to-b from-transparent to-emerald-100 opacity-0 transition-all duration-300 group-hover:bottom-0 group-hover:opacity-100" />
                      </Card>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* About */}
              {p.bio && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">
                    About
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.bio}</p>
                </motion.section>
              )}

              {/* About this gig */}
              {p.aboutThisGig && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.15 }}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">
                    About this gig
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {p.aboutThisGig}
                  </p>
                </motion.section>
              )}

              {/* What I offer */}
              {(p.whatIOffer?.length ?? 0) > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.2 }}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">
                    What I offer
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.whatIOffer!.map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="rounded-full bg-emerald-50 text-emerald-700"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Skills */}
              {(p.skills?.length ?? 0) > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.25 }}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">
                    Skills
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.skills!.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Services */}
              {(p.services?.length ?? 0) > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.3 }}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">
                    Services
                  </h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {p.services!.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </motion.section>
              )}

              {/* PORTFOLIO — modern grid + lightbox */}
              {/* PORTFOLIO — shadcn Carousel (buttons only) */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.35 }}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">
                    Portfolio
                  </h3>
                  {p.portfolio?.length ? (
                    <span className="text-xs text-muted-foreground">
                      {p.portfolio.length} item
                      {p.portfolio.length !== 1 ? "s" : ""}
                    </span>
                  ) : null}
                </div>

                {!p.portfolio?.length ? (
                  <div className="text-sm text-muted-foreground">
                    No portfolio items.
                  </div>
                ) : (
                  <Carousel
                    opts={{ align: "start", loop: true }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {p.portfolio.map((it, idx) => (
                        <CarouselItem
                          key={`${it.title}-${idx}`}
                          className="md:basis-1/2 lg:basis-1/3"
                        >
                          <Card className="group relative overflow-hidden rounded-2xl border border-gray-200">
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="w-full text-left">
                                  <div className="relative h-56 w-full overflow-hidden">
                                    {it.imageUrl ? (
                                      <Image
                                        src={it.imageUrl}
                                        alt={it.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-muted">
                                        <span className="text-muted-foreground">
                                          No Image
                                        </span>
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                                  </div>
                                  <CardContent className="p-3">
                                    <div className="truncate font-medium">
                                      {it.title}
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                      {it.description}
                                    </p>
                                  </CardContent>
                                </button>
                              </DialogTrigger>

                              {/* Lightbox */}
                              <DialogContent className="max-w-3xl p-0">
                                <div className="relative aspect-video w-full">
                                  {it.imageUrl ? (
                                    <Image
                                      src={it.imageUrl}
                                      alt={it.title}
                                      fill
                                      className="rounded-t-2xl object-cover"
                                      priority
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                      <span className="text-muted-foreground">
                                        No Image
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h4 className="text-base font-semibold">
                                        {it.title}
                                      </h4>
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        {it.description}
                                      </p>
                                    </div>
                                    <DialogClose asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Close"
                                      >
                                        <X className="h-5 w-5" />
                                      </Button>
                                    </DialogClose>
                                  </div>

                                  {it.projectUrl && (
                                    <div className="mt-3">
                                      <a
                                        href={it.projectUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-primary underline hover:text-primary/80 break-all"
                                      >
                                        Open project
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    {/* Buttons only (no autoplay) */}
                    <CarouselPrevious className="left-2 bg-white/90 hover:bg-white text-foreground" />
                    <CarouselNext className="right-2 bg-white/90 hover:bg-white text-foreground" />
                  </Carousel>
                )}
              </motion.section>
            </div>

            {/* RIGHT */}
            <aside className="space-y-6">
              {/* Contact (kept) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.4 }}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <h3 className="text-sm font-semibold">Contact</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Send a message to discuss your project and get a custom offer.
                </p>
                <Button onClick={() => startMessage()} className="mt-4 w-full">
                  Message {p.userName.split(" ")[0] || "Freelancer"}
                </Button>
              </motion.div>

              {/* (Removed Social section as requested) */}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
