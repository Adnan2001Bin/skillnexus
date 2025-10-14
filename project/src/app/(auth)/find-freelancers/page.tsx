// src/app/find-freelancers/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CategoryFilterDisplay from "@/components/client/CategoryFilterDisplay";
import { categories, servicesByCategory } from "@/lib/freelance-categories";
import {
  Search,
  Briefcase,
  ChartBarStacked,
  Loader2,
  ScanSearch,
} from "lucide-react";
import { Images } from "@/lib/images";

type Item = {
  _id: string;
  userName: string;
  email: string;
  profilePicture?: string | null;
  location?: string | null;
  category?: string | null;
  categoryLabel?: string | null;
  services?: string[];
  skills?: string[];
  portfolioCount: number;
  minPrice: number | null;
  bio?: string | null;
};

export default function FindFreelancersPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);

  // filters synced to URL
  const [q, setQ] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [services, setServices] = useState<string[]>(
    params.get("services")
      ? params.get("services")!.split(",").filter(Boolean)
      : []
  );

  const page = Number(params.get("page") || "1");
  const limit = 12;

  const serviceOptions = useMemo(
    () =>
      category !== "all"
        ? (servicesByCategory as Record<string, string[]>)[category]?.map(
            (s) => ({ value: s, label: s })
          ) || []
        : [],
    [category]
  );

  const updateURL = (pageOverride?: number) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (category && category !== "all") qs.set("category", category);
    if (services.length) qs.set("services", services.join(","));
    qs.set("page", String(pageOverride ?? 1));
    router.push(`/find-freelancers?${qs.toString()}`);
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (category && category !== "all") qs.set("category", category);
      if (services.length) qs.set("services", services.join(","));
      qs.set("page", String(page));
      qs.set("limit", String(limit));
      const res = await fetch(`/api/client/freelancers?${qs.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed");
      setItems(json.items || []);
      setTotal(json.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // initial + whenever URL params change
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  // keep local filter state in sync with URL
  useEffect(() => {
    const uQ = params.get("q") || "";
    const uCat = params.get("category") || "all";
    const uSvc = params.get("services")
      ? params.get("services")!.split(",").filter(Boolean)
      : [];
    setQ(uQ);
    setCategory(uCat);
    setServices(uSvc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(1);
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total]
  );

  return (
    <div className="min-h-screen">
      {/* Hero with category summary */}
      <div
        className="min-h-[24rem] h-auto font-sans py-10 px-4 sm:px-6 lg:px-10 flex items-center justify-center"
        style={{
          backgroundImage: `url(${Images.background1 ? Images.background1.src : ""})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full">
          <CategoryFilterDisplay categoryFilter={category || "all"} />
        </div>
      </div>

      <div className="bg-slate-50/70">
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          {/* Filter card — modern glass panel */}
          <div className="mb-12">
            <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 p-[1px]">
              <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl ring-1 ring-black/5">
                {/* soft glow accents */}
                <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />

                <div className="relative px-6 py-8 md:px-10 md:py-10">
                  {/* Header */}
                  <div className="mb-6 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                      Curated Freelancers
                    </span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                      Find the Perfect <span className="text-emerald-700">Freelancer</span> ✨
                    </h2>
                    <p className="mx-auto mt-2 max-w-2xl text-lg text-slate-600">
                      Filter by category, service, or keywords to discover approved professionals.
                    </p>
                  </div>

                  {/* Unified bar */}
                  <form onSubmit={onSearchSubmit} className="mx-auto max-w-4xl">
                    <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-5">
                      {/* Category */}
                      <div className="relative col-span-1 border-b border-slate-200 md:col-span-2 md:border-b-0 md:border-r">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <ChartBarStacked className="h-5 w-5 text-slate-400" />
                        </div>
                        <select
                          value={category}
                          onChange={(e) => {
                            setCategory(e.target.value);
                            setServices([]); // reset services on category change
                          }}
                          className="h-16 w-full rounded-none border-none bg-transparent px-12 text-base font-medium text-slate-800 focus:outline-none"
                          aria-label="Select category"
                        >
                          <option value="all">All Categories</option>
                          {categories.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Search */}
                      <div className="relative col-span-1 md:col-span-3">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          placeholder="Search by name, skill, location..."
                          className="h-16 w-full rounded-none border-none bg-transparent px-12 text-base placeholder-slate-400 focus:outline-none"
                        />
                        {/* Apply button (only on md+) */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center pr-2 md:flex">
                          <button
                            type="submit"
                            className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            Apply filters
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Services multi-select */}
                    <div className="mt-4">
                      <ServiceMultiSelect
                        options={serviceOptions}
                        values={services}
                        onChange={setServices}
                      />
                    </div>

                    {/* Mobile action row */}
                    <div className="mt-4 flex items-center justify-between md:hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setCategory("all");
                          setServices([]);
                          setQ("");
                          updateURL(1);
                        }}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Apply filters
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Results header */}
          <div className="mb-6 flex items-center justify-between px-2">
            <h3 className="text-xl font-semibold text-gray-700">
              {loading
                ? "Searching freelancers…"
                : `Showing ${items.length} of ${total} result${total !== 1 ? "s" : ""}`}
            </h3>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-emerald-600" />
              <p className="text-xl font-medium text-gray-700">Loading freelancers…</p>
              <p className="mt-1 text-gray-500">Finding the best experts for you.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed bg-white py-16 text-center">
              <ScanSearch className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-2xl font-semibold text-gray-800">No Freelancers Found</h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your filters or broadening your search.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((f) => (
                  <motion.div
                    key={f._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="flex items-center gap-3 p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.profilePicture || "/images/avatar-placeholder.png"}
                        alt={f.userName}
                        className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">
                          {f.userName}
                        </div>
                        <div className="truncate text-xs text-slate-600">
                          {f.categoryLabel || "—"}
                          {f.location ? ` • ${f.location}` : ""}
                        </div>
                      </div>
                    </div>

                    {f.bio && (
                      <p className="line-clamp-3 px-4 text-sm text-slate-700">
                        {f.bio}
                      </p>
                    )}

                    <div className="px-4 pb-2 pt-3">
                      <div className="flex flex-wrap gap-2">
                        {(f.skills || []).slice(0, 5).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 p-4">
                      <div className="text-xs text-slate-600">
                        {typeof f.minPrice === "number" ? `From $${f.minPrice}` : ""}
                        {f.portfolioCount ? (
                          <span className="ml-2 text-slate-500">• {f.portfolioCount} projects</span>
                        ) : null}
                      </div>
                      <Link
                        href={`/find-freelancers/${f._id}`}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        View profile
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const active = p === page;

                const qs = new URLSearchParams();
                if (q) qs.set("q", q);
                if (category && category !== "all") qs.set("category", category);
                if (services.length) qs.set("services", services.join(","));
                qs.set("page", String(p));

                return (
                  <Link
                    key={p}
                    href={`/find-freelancers?${qs.toString()}`}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                      active
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------- modern Service multi-select (chips) -------- */
function ServiceMultiSelect({
  options,
  values,
  onChange,
}: {
  options: { value: string; label: string }[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  // empty when no category selected
  if (!options?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-4 text-sm text-slate-600">
        Select a category to filter by specific services.
      </div>
    );
  }

  const toggle = (v: string) => {
    const set = new Set(values);
    set.has(v) ? set.delete(v) : set.add(v);
    onChange(Array.from(set));
  };

  const clear = () => onChange([]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Briefcase className="h-4 w-4 text-slate-500" />
          Services
        </div>
        {values.length > 0 && (
          <button
            onClick={clear}
            className="text-xs font-medium text-slate-600 hover:text-emerald-700 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = values.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={[
                "group rounded-full px-3 py-1.5 text-sm ring-1 transition",
                active
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
              ].join(" ")}
              title={opt.label}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {values.length > 0 && (
        <div className="mt-3 text-xs text-slate-500">
          Selected:{" "}
          <span className="font-medium text-slate-700">{values.length}</span>
        </div>
      )}
    </div>
  );
}
