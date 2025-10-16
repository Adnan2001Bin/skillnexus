// app/onboarding/freelancer/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProfilePictureField } from "@/components/ProfilePictureField";
import { categories, servicesByCategory } from "@/lib/freelance-categories";
import Image from "next/image";
import { Images } from "@/lib/images";
import PortfolioImageField from "@/components/PortfolioImageField";

/* ---------------- Types ---------------- */
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
  imageUrl?: string;
  projectUrl?: string;
};

type RequirementType = "text" | "textarea" | "multiple_choice" | "file" | "instructions";

type RequirementItem = {
  id: string;
  type: RequirementType;
  question?: string;          // for text / textarea / multiple_choice / file
  required?: boolean;
  placeholder?: string;       // text / textarea
  helperText?: string;        // any
  // multiple choice
  options?: string[];
  allowMultiple?: boolean;
  // file
  accepts?: string[];         // e.g., ['.png', '.jpg', '.pdf']
  maxFiles?: number;          // e.g., 3
  // instructions
  content?: string;           // body text for "instructions" box
};

/* ---------------- Steps ---------------- */
const steps = [
  { key: "basics", label: "Basics", icon: BasicIcon },
  { key: "skills", label: "Skills", icon: StarIcon },
  { key: "portfolio", label: "Portfolio", icon: GalleryIcon },
  { key: "packages", label: "Packages", icon: PackageIcon },
  { key: "requirements", label: "Requirements", icon: ClipboardIcon },
  { key: "preview", label: "Preview", icon: EyeIcon },
];

/* ---------------- Helpers ---------------- */
function normalizeRatePlans(existing?: RatePlan[]): RatePlan[] {
  const byType = new Map((existing || []).map((p) => [p.type, p]));
  const base = (type: RatePlan["type"]) =>
    byType.get(type) || {
      type,
      price: 0,
      description: "",
      whatsIncluded: [],
      deliveryDays: type === "Basic" ? 3 : type === "Standard" ? 5 : 7,
      revisions: type === "Basic" ? 1 : type === "Standard" ? 2 : 3,
    };
  return [base("Basic"), base("Standard"), base("Premium")];
}

const rid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));

/* ---------------- Page ---------------- */
export default function FreelancerOnboardingPage() {
  const params = useSearchParams();
  const router = useRouter();

  // Optional query params you were using
  const email = (params.get("email") || "").trim();
  const userName = (params.get("user") || "").trim();

  // Treat as edit when ?edit=1 (default to edit if param missing and you’re linking from profile)
  const isEdit = (params.get("edit") || "1") === "1";

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // edit bootstrap flags
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const [form, setForm] = useState({
    location: "",
    profilePicture: "",
    bio: "",
    category: "", // e.g. "programming_tech"
    services: [] as string[],
    skills: [] as string[],
    portfolio: [] as PortfolioItem[],
    ratePlans: normalizeRatePlans(),
    aboutThisGig: "",
    whatIOffer: [] as string[],
    socialLinks: [] as { platform: string; url: string }[],
    languageProficiency: [] as string[],
    // NEW: Requirements
    requirements: [] as RequirementItem[],
  });

  const inputClass =
    "rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none ring-emerald-500 focus:ring-2";

  /* ---------- Tag helpers ---------- */
  const addTag = (
    field: "skills" | "whatIOffer" | "languageProficiency",
    value: string
  ) => {
    if (!value.trim()) return;
    setForm((f) => ({
      ...f,
      [field]: Array.from(new Set([...(f[field] as string[]), value.trim()])),
    }));
  };
  const removeTag = (
    field: "skills" | "whatIOffer" | "languageProficiency",
    value: string
  ) =>
    setForm((f) => ({
      ...f,
      [field]: (f[field] as string[]).filter((t) => t !== value),
    }));

  /* ---------- Portfolio helpers ---------- */
  const addPortfolio = () =>
    setForm((f) => ({
      ...f,
      portfolio: [...f.portfolio, { title: "", description: "" }],
    }));
  const updatePortfolio = (i: number, patch: Partial<PortfolioItem>) =>
    setForm((f) => ({
      ...f,
      portfolio: f.portfolio.map((p, idx) =>
        idx === i ? { ...p, ...patch } : p
      ),
    }));
  const removePortfolio = (i: number) =>
    setForm((f) => ({
      ...f,
      portfolio: f.portfolio.filter((_, idx) => idx !== i),
    }));

  /* ---------- Plans helper ---------- */
  const updatePlan = (i: number, patch: Partial<RatePlan>) =>
    setForm((f) => ({
      ...f,
      ratePlans: f.ratePlans.map((p, idx) =>
        idx === i ? { ...p, ...patch } : p
      ),
    }));

  /* ---------- Requirements helpers ---------- */
  const addRequirement = (type: RequirementType) => {
    const base: RequirementItem = {
      id: rid(),
      type,
      required: true,
    };
    if (type === "instructions") {
      base.content =
        "Describe your project in detail, including goals, target audience, scope, references, and deadlines.";
    } else if (type === "text") {
      base.question = "What’s your website URL?";
      base.placeholder = "https://example.com";
    } else if (type === "textarea") {
      base.question = "What kind of vibe do you want for the video?";
      base.placeholder = "e.g., friendly, cinematic, minimal";
    } else if (type === "multiple_choice") {
      base.question = "Choose your video style:";
      base.options = ["Cinematic", "Vlog", "Corporate"];
      base.allowMultiple = false;
    } else if (type === "file") {
      base.question = "Upload your logo, script, or reference images";
      base.accepts = [".png", ".jpg", ".jpeg", ".pdf"];
      base.maxFiles = 3;
    }
    setForm((f) => ({ ...f, requirements: [...(f.requirements || []), base] }));
  };

  const updateRequirement = (id: string, patch: Partial<RequirementItem>) =>
    setForm((f) => ({
      ...f,
      requirements: f.requirements.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    }));

  const removeRequirement = (id: string) =>
    setForm((f) => ({
      ...f,
      requirements: f.requirements.filter((r) => r.id !== id),
    }));

  const addMCOption = (id: string, value: string) => {
    if (!value.trim()) return;
    setForm((f) => ({
      ...f,
      requirements: f.requirements.map((r) =>
        r.id === id
          ? { ...r, options: Array.from(new Set([...(r.options || []), value.trim()])) }
          : r
      ),
    }));
  };

  const removeMCOption = (id: string, value: string) =>
    setForm((f) => ({
      ...f,
      requirements: f.requirements.map((r) =>
        r.id === id
          ? { ...r, options: (r.options || []).filter((o) => o !== value) }
          : r
      ),
    }));

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  /* ---------- Save ---------- */
  const saveAll = async () => {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/onboarding/freelancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to save");
      setMsg("Profile saved! Redirecting…");
      setTimeout(() => router.push("/freelancer/profile"), 900);
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Prefill existing profile in edit mode ---------- */
  useEffect(() => {
    if (!isEdit || bootstrapped) return;

    (async () => {
      try {
        setLoadingExisting(true);
        const res = await fetch("/api/freelancer/profile", {
          cache: "no-store",
        });
        const json = await res.json();

        const p = json.profile || {};

        setForm((f) => ({
          ...f,
          location: p.location || "",
          profilePicture: p.profilePicture || "",
          bio: p.bio || "",
          category: p.category || "",
          services: Array.isArray(p.services) ? p.services : [],
          skills: Array.isArray(p.skills) ? p.skills : [],
          portfolio: Array.isArray(p.portfolio)
            ? p.portfolio.map((it: any) => ({
                title: it?.title || "",
                description: it?.description || "",
                imageUrl: it?.imageUrl || "",
                projectUrl: it?.projectUrl || "",
              }))
            : [],
          ratePlans: normalizeRatePlans(p.ratePlans),
          aboutThisGig: p.aboutThisGig || "",
          whatIOffer: Array.isArray(p.whatIOffer) ? p.whatIOffer : [],
          socialLinks: Array.isArray(p.socialLinks)
            ? p.socialLinks.map((s: any) => ({
                platform: s?.platform || "",
                url: s?.url || "",
              }))
            : [],
          languageProficiency: Array.isArray(p.languageProficiency)
            ? p.languageProficiency
            : [],
          requirements: Array.isArray(p.requirements)
            ? p.requirements.map((r: any) => ({
                id: r.id || rid(),
                type: r.type,
                question: r.question || "",
                required: !!r.required,
                placeholder: r.placeholder || "",
                helperText: r.helperText || "",
                options: Array.isArray(r.options) ? r.options : [],
                allowMultiple: !!r.allowMultiple,
                accepts: Array.isArray(r.accepts) ? r.accepts : [],
                maxFiles: typeof r.maxFiles === "number" ? r.maxFiles : undefined,
                content: r.content || "",
              }))
            : [],
        }));

        setBootstrapped(true);
      } catch (e) {
        console.error("hydrate edit form error:", e);
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, [isEdit, bootstrapped]);

  /* ---------- Derived UI bits ---------- */
  const previewSkills = useMemo(() => form.skills.slice(0, 6), [form.skills]);
  const serviceOptions = useMemo(
    () => (form.category ? servicesByCategory[form.category] || [] : []),
    [form.category]
  );
  const selectedCategoryLabel =
    categories.find((c) => c.value === form.category)?.label || "Category";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* light emerald/cyan blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      {/* Top-left logo */}
      <header className="absolute left-4 top-4 z-20">
        <a href="/" aria-label="Home" className="inline-block">
          <Image
            src={Images.logo}
            alt="Logo"
            width={150}
            height={40}
            className="object-contain"
            priority
          />
        </a>
      </header>

      <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-8 mt-7">
        {/* top progress */}
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        {/* header + stepper */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {isEdit
                ? "Edit your profile"
                : "Hello, " + (userName || "Freelancer") + " 👋"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {isEdit
                ? "Update your professional profile."
                : "Let’s set up your professional profile."}
            </p>
            {loadingExisting && (
              <div className="mt-2 text-xs text-slate-500">
                Loading your existing details…
              </div>
            )}
          </div>

          <nav className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm md:w-auto">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <button
                  key={s.key}
                  onClick={() => setStep(i)}
                  className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition
                    ${
                      active
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : done
                        ? "text-emerald-700 hover:bg-emerald-50"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      active
                        ? "text-emerald-600"
                        : done
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  />
                  <span className="hidden md:inline">{s.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* content */}
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_360px]">
          {/* form card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
          >
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="basics"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  {/* Location */}
                  <div className="grid gap-1">
                    <label className="text-sm font-medium text-slate-700">
                      Location
                    </label>
                    <input
                      value={form.location}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, location: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="City, Country"
                    />
                  </div>

                  {/* Profile Picture */}
                  <ProfilePictureField
                    label="Profile picture"
                    value={form.profilePicture}
                    onChange={(url) =>
                      setForm((f) => ({ ...f, profilePicture: url }))
                    }
                  />

                  {/* Bio */}
                  <div className="md:col-span-2 grid gap-1">
                    <label className="text-sm font-medium text-slate-700">
                      Bio
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bio: e.target.value }))
                      }
                      rows={4}
                      className={inputClass}
                      placeholder="Tell clients what you do best, your experience and what makes you unique."
                    />
                  </div>

                  {/* Category (select) */}
                  <div className="grid gap-1">
                    <label className="text-sm font-medium text-slate-700">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        className={`${inputClass} appearance-none`}
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            category: e.target.value,
                            services: [], // reset services on category change
                          }))
                        }
                      >
                        <option value="">Select a category…</option>
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      {/* caret */}
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        ▾
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Choose the primary marketplace category for your services.
                    </p>
                  </div>

                  {/* Services (multi-select) */}
                  <div className="md:col-span-2 grid gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">
                        Services{" "}
                        {form.category ? (
                          <span className="text-slate-500">
                            ({selectedCategoryLabel})
                          </span>
                        ) : null}
                      </label>
                      {form.services.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, services: [] }))
                          }
                          className="text-xs text-slate-600 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {form.category ? (
                      serviceOptions.length > 0 ? (
                        <ServiceMultiSelect
                          options={serviceOptions}
                          values={form.services}
                          onToggle={(service) =>
                            setForm((f) => {
                              const selected = new Set(f.services);
                              if (selected.has(service))
                                selected.delete(service);
                              else selected.add(service);
                              return { ...f, services: Array.from(selected) };
                            })
                          }
                        />
                      ) : (
                        <div className="text-sm text-slate-500">
                          No services available for this category.
                        </div>
                      )
                    ) : (
                      <div className="text-sm text-slate-500">
                        Select a category to choose services.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <label className="text-sm font-medium text-slate-700">
                    Skills{" "}
                    <span className="text-slate-500">(press Enter to add)</span>
                  </label>
                  <TagInput
                    values={form.skills}
                    onAdd={(v) => addTag("skills", v)}
                    onRemove={(v) => removeTag("skills", v)}
                    placeholder="React, Node, MongoDB"
                  />
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-700">
                      Languages
                    </label>
                    <TagInput
                      values={form.languageProficiency}
                      onAdd={(v) => addTag("languageProficiency", v)}
                      onRemove={(v) => removeTag("languageProficiency", v)}
                      placeholder="English, Bengali"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-700">
                      What I Offer
                    </label>
                    <TagInput
                      values={form.whatIOffer}
                      onAdd={(v) => addTag("whatIOffer", v)}
                      onRemove={(v) => removeTag("whatIOffer", v)}
                      placeholder="Full-stack apps, API integration"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="portfolio"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={addPortfolio}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    + Add item
                  </button>

                  {form.portfolio.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          className={inputClass}
                          placeholder="Title"
                          value={p.title}
                          onChange={(e) =>
                            updatePortfolio(i, { title: e.target.value })
                          }
                        />
                        <input
                          className={inputClass}
                          placeholder="Project URL (optional)"
                          value={p.projectUrl || ""}
                          onChange={(e) =>
                            updatePortfolio(i, { projectUrl: e.target.value })
                          }
                        />
                        <PortfolioImageField
                          label="Portfolio image"
                          value={p.imageUrl || ""}
                          onChange={(url) =>
                            updatePortfolio(i, { imageUrl: url })
                          }
                          onClear={() => updatePortfolio(i, { imageUrl: "" })}
                        />
                        <textarea
                          className={`${inputClass} md:col-span-2`}
                          placeholder="Short description"
                          value={p.description}
                          onChange={(e) =>
                            updatePortfolio(i, { description: e.target.value })
                          }
                        />
                      </div>
                      <div className="mt-2 text-right">
                        <button
                          type="button"
                          onClick={() => removePortfolio(i)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="packages"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {/* Section heading */}
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Packages</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Set up your Basic, Standard, and Premium offerings. Be specific so clients know exactly what they’ll get.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {form.ratePlans.map((plan, i) => {
                      const idBase = `plan-${plan.type.toLowerCase()}`;
                      return (
                        <div
                          key={plan.type}
                          className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900">
                              {plan.type} Package
                            </h3>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
                              {plan.deliveryDays}d • {plan.revisions} rev
                            </span>
                          </div>

                          {/* Price */}
                          <label
                            htmlFor={`${idBase}-price`}
                            className="text-xs font-medium text-slate-700"
                          >
                            Price (USD)
                          </label>
                          <input
                            id={`${idBase}-price`}
                            className={`${inputClass} mt-1`}
                            type="number"
                            min={0}
                            value={plan.price}
                            onChange={(e) => updatePlan(i, { price: +e.target.value })}
                            placeholder="e.g., 99"
                          />

                          {/* Delivery days */}
                          <label
                            htmlFor={`${idBase}-delivery`}
                            className="mt-3 block text-xs font-medium text-slate-700"
                          >
                            Delivery time (days)
                          </label>
                          <input
                            id={`${idBase}-delivery`}
                            className={`${inputClass} mt-1`}
                            type="number"
                            min={1}
                            value={plan.deliveryDays}
                            onChange={(e) =>
                              updatePlan(i, { deliveryDays: +e.target.value })
                            }
                            placeholder="e.g., 5"
                          />

                          {/* Revisions */}
                          <label
                            htmlFor={`${idBase}-revisions`}
                            className="mt-3 block text-xs font-medium text-slate-700"
                          >
                            Number of revisions
                          </label>
                          <input
                            id={`${idBase}-revisions`}
                            className={`${inputClass} mt-1`}
                            type="number"
                            min={0}
                            value={plan.revisions}
                            onChange={(e) => updatePlan(i, { revisions: +e.target.value })}
                            placeholder="e.g., 2"
                          />

                          {/* Description */}
                          <label
                            htmlFor={`${idBase}-desc`}
                            className="mt-3 block text-xs font-medium text-slate-700"
                          >
                            Short description
                          </label>
                          <textarea
                            id={`${idBase}-desc`}
                            className={`${inputClass} mt-1`}
                            rows={3}
                            value={plan.description}
                            onChange={(e) => updatePlan(i, { description: e.target.value })}
                            placeholder="Summarize what this package delivers."
                          />

                          {/* What’s included */}
                          <div className="mt-3">
                            <label className="text-xs font-medium text-slate-700">
                              What’s included{" "}
                              <span className="text-slate-500">(press Enter to add)</span>
                            </label>
                            <TagInput
                              values={plan.whatsIncluded}
                              onAdd={(v) =>
                                updatePlan(i, {
                                  whatsIncluded: Array.from(
                                    new Set([...(plan.whatsIncluded || []), v])
                                  ),
                                })
                              }
                              onRemove={(v) =>
                                updatePlan(i, {
                                  whatsIncluded: (plan.whatsIncluded || []).filter(
                                    (x) => x !== v
                                  ),
                                })
                              }
                              placeholder="e.g., Landing page, API integration, Tests"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* About + Social */}
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">
                        About this Gig
                      </label>
                      <textarea
                        className={`${inputClass} mt-1 w-full`}
                        rows={4}
                        value={form.aboutThisGig}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            aboutThisGig: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">
                        Social Links
                      </label>
                      <SocialLinksEditor
                        values={form.socialLinks}
                        onChange={(values) => setForm((f) => ({ ...f, socialLinks: values }))}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="requirements"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Requirements</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Create a mini-questionnaire clients must complete after ordering. This helps you start fast with the right inputs.
                    </p>
                  </div>

                  <RequirementsEditor
                    items={form.requirements}
                    onAdd={addRequirement}
                    onUpdate={updateRequirement}
                    onRemove={removeRequirement}
                    onAddMCOption={addMCOption}
                    onRemoveMCOption={removeMCOption}
                  />
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <p className="text-slate-700">
                    Looks great! Review the live preview on the right. When
                    ready, click{" "}
                    <span className="font-semibold text-emerald-700">
                      Save & Finish
                    </span>
                    .
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* controls */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={prev}
                disabled={step === 0}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  onClick={next}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow hover:bg-emerald-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={saveAll}
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-70"
                >
                  {saving ? "Saving…" : "Save & Finish"}
                </button>
              )}
            </div>

            <div className="mt-4">
              {err && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {err}
                </div>
              )}
              {msg && (
                <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  {msg}
                </div>
              )}
            </div>
          </motion.div>

          {/* live preview */}
          <aside className="top-6 hidden md:block">
            <div className="sticky top-6">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-emerald-200">
                    {form.profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.profilePicture}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                        <UserIcon className="h-7 w-7" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {userName || "Your name"}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {selectedCategoryLabel}
                    </p>
                    <p className="text-xs text-slate-500">
                      {form.location || "Location"}
                    </p>
                  </div>
                </div>

                {form.bio && (
                  <p className="mt-4 line-clamp-4 text-sm text-slate-700">
                    {form.bio}
                  </p>
                )}

                {previewSkills.length > 0 && (
                  <>
                    <div className="mt-5 text-xs uppercase tracking-wide text-slate-500">
                      Key Skills
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {previewSkills.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {form.services.length > 0 && (
                  <>
                    <div className="mt-5 text-xs uppercase tracking-wide text-slate-500">
                      Services
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {form.services.slice(0, 6).map((svc) => (
                        <li key={svc}>{svc}</li>
                      ))}
                      {form.services.length > 6 && (
                        <li className="text-slate-500">
                          +{form.services.length - 6} more
                        </li>
                      )}
                    </ul>
                  </>
                )}

                {form.ratePlans.some((p) => p.price > 0) && (
                  <>
                    <div className="mt-6 text-xs uppercase tracking-wide text-slate-500">
                      Packages
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {form.ratePlans.map((p) => (
                        <div
                          key={p.type}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center"
                        >
                          <div className="text-[11px] text-slate-600">
                            {p.type}
                          </div>
                          <div className="text-sm font-semibold text-slate-900">
                            {p.price > 0 ? `$${p.price}` : "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Preview Requirements */}
                {form.requirements.length > 0 && (
                  <>
                    <div className="mt-6 text-xs uppercase tracking-wide text-slate-500">
                      Requirements (client sees after ordering)
                    </div>
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      {form.requirements.map((r) => (
                        <li key={r.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                          <div className="text-xs text-slate-500">
                            {r.type.replace("_", " ")} {r.required ? "• required" : ""}
                          </div>
                          {r.type === "instructions" ? (
                            <div className="mt-1">{r.content}</div>
                          ) : (
                            <>
                              <div className="font-medium">{r.question}</div>
                              {r.type === "multiple_choice" && r.options?.length ? (
                                <div className="mt-1 text-slate-600">
                                  Options: {r.options.join(", ")}
                                </div>
                              ) : null}
                              {r.type === "file" && (
                                <div className="mt-1 text-slate-600">
                                  Accepts: {(r.accepts || []).join(", ") || "any"} • Max files:{" "}
                                  {r.maxFiles || 1}
                                </div>
                              )}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </motion.div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Requirements Editor ---------------- */
function RequirementsEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
  onAddMCOption,
  onRemoveMCOption,
}: {
  items: RequirementItem[];
  onAdd: (type: RequirementType) => void;
  onUpdate: (id: string, patch: Partial<RequirementItem>) => void;
  onRemove: (id: string) => void;
  onAddMCOption: (id: string, value: string) => void;
  onRemoveMCOption: (id: string, value: string) => void;
}) {
  const [mcDraft, setMcDraft] = useState<Record<string, string>>({});

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
          onClick={() => onAdd("text")}
        >
          + Text question
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
          onClick={() => onAdd("textarea")}
        >
          + Long answer
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
          onClick={() => onAdd("multiple_choice")}
        >
          + Multiple choice
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
          onClick={() => onAdd("file")}
        >
          + File upload
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
          onClick={() => onAdd("instructions")}
        >
          + Instructions box
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            No requirements yet. Add a question above to get started.
          </div>
        ) : null}

        {items.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                {labelForType(r.type)}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!r.required}
                    onChange={(e) => onUpdate(r.id, { required: e.target.checked })}
                  />
                  Required
                </label>
                <button
                  type="button"
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => onRemove(r.id)}
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Common fields */}
            {r.type !== "instructions" ? (
              <>
                <label className="mt-3 block text-xs font-medium text-slate-700">
                  Question / Prompt
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 focus:ring-2"
                  value={r.question || ""}
                  onChange={(e) => onUpdate(r.id, { question: e.target.value })}
                  placeholder="What do you need from the client?"
                />
                {(r.type === "text" || r.type === "textarea") && (
                  <>
                    <label className="mt-3 block text-xs font-medium text-slate-700">
                      Placeholder (optional)
                    </label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 focus:ring-2"
                      value={r.placeholder || ""}
                      onChange={(e) => onUpdate(r.id, { placeholder: e.target.value })}
                      placeholder="e.g., https://example.com"
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <label className="mt-3 block text-xs font-medium text-slate-700">
                  Instructions
                </label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 focus:ring-2"
                  rows={4}
                  value={r.content || ""}
                  onChange={(e) => onUpdate(r.id, { content: e.target.value })}
                  placeholder="Describe what clients should provide and any tips to help you start quickly."
                />
              </>
            )}

            {/* Multiple choice */}
            {r.type === "multiple_choice" && (
              <div className="mt-3">
                <label className="text-xs font-medium text-slate-700">
                  Options
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(r.options || []).map((o) => (
                    <span
                      key={o}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 ring-1 ring-emerald-200"
                    >
                      {o}
                      <button
                        type="button"
                        className="text-emerald-700/70 hover:text-emerald-900"
                        onClick={() => onRemoveMCOption(r.id, o)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 focus:ring-2"
                    placeholder="Add an option and press Enter"
                    value={mcDraft[r.id] || ""}
                    onChange={(e) =>
                      setMcDraft((m) => ({ ...m, [r.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (mcDraft[r.id] || "").trim();
                        if (val) onAddMCOption(r.id, val);
                        setMcDraft((m) => ({ ...m, [r.id]: "" }));
                      }
                    }}
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-700 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={!!r.allowMultiple}
                      onChange={(e) =>
                        onUpdate(r.id, { allowMultiple: e.target.checked })
                      }
                    />
                    Allow multiple
                  </label>
                </div>
              </div>
            )}

            {/* File upload meta */}
            {r.type === "file" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Accept file types (comma-separated extensions)
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 focus:ring-2"
                    value={(r.accepts || []).join(", ")}
                    onChange={(e) =>
                      onUpdate(r.id, {
                        accepts: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder=".png, .jpg, .jpeg, .pdf"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Max files
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 focus:ring-2"
                    value={r.maxFiles || 1}
                    onChange={(e) =>
                      onUpdate(r.id, { maxFiles: Math.max(1, +e.target.value || 1) })
                    }
                    placeholder="1"
                  />
                </div>
              </div>
            )}

            {/* Helper text */}
            <label className="mt-3 block text-xs font-medium text-slate-700">
              Helper text (optional)
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 focus:ring-2"
              value={r.helperText || ""}
              onChange={(e) => onUpdate(r.id, { helperText: e.target.value })}
              placeholder="Tips or clarification shown below the field"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function labelForType(t: RequirementType) {
  switch (t) {
    case "text":
      return "Text question";
    case "textarea":
      return "Long answer";
    case "multiple_choice":
      return "Multiple choice";
    case "file":
      return "File upload";
    case "instructions":
      return "Instructions box";
    default:
      return "Requirement";
  }
}

/* ---- Service Multi Select (checkbox chips) ---- */
function ServiceMultiSelect({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (service: string) => void;
}) {
  if (!options?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = values.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onToggle(opt)}
              className={`rounded-full px-3 py-1 text-sm ring-1 transition
                ${
                  active
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                }`}
              title={opt}
            >
              <span className="line-clamp-1">{opt}</span>
            </button>
          );
        })}
      </div>
      {values.length > 0 && (
        <div className="mt-2 text-xs text-slate-500">
          Selected:{" "}
          <span className="font-medium text-slate-700">{values.length}</span>
        </div>
      )}
    </div>
  );
}

/* ----- Tag Input ----- */
function TagInput({
  values,
  onAdd,
  onRemove,
  placeholder,
}: {
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder?: string;
}) {
  const [val, setVal] = useState("");
  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none ring-emerald-500 focus:ring-2";
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 ring-1 ring-emerald-200"
          >
            {v}
            <button
              type="button"
              onClick={() => onRemove(v)}
              className="text-emerald-700/70 hover:text-emerald-900"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        className={inputClass}
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (val.trim()) onAdd(val.trim());
            setVal("");
          }
        }}
      />
    </div>
  );
}

/* ----- Social Links Editor ----- */
function SocialLinksEditor({
  values,
  onChange,
}: {
  values: { platform: string; url: string }[];
  onChange: (v: { platform: string; url: string }[]) => void;
}) {
  const inputClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none ring-emerald-500 focus:ring-2";
  const add = () => onChange([...(values || []), { platform: "", url: "" }]);
  const update = (
    i: number,
    patch: Partial<{ platform: string; url: string }>
  ) => onChange(values.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
      >
        + Add link
      </button>
      {(values || []).map((v, i) => (
        <div key={i} className="grid gap-2 md:grid-cols-2">
          <input
            className={inputClass}
            placeholder="Platform (e.g., GitHub, Dribbble)"
            value={v.platform}
            onChange={(e) => update(i, { platform: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="https://..."
            value={v.url}
            onChange={(e) => update(i, { url: e.target.value })}
          />
          <div className="md:col-span-2 text-right">
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----- icons (currentColor) ----- */
function BasicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="3"
        y="4"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 18.9 6.2 20.8l1.1-6.4L2.6 9.8l6.5-.9L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
function GalleryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="3"
        y="4"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M7 14l3-3 3 3 4-4 3 3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3 7l9-4 9 4v10l-9 4-9-4V7z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M12 3v18M3 7l9 4 9-4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="7" y="3" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10h8M8 14h8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
