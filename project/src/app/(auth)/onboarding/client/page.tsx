// app/onboarding/client/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProfilePictureField } from "@/components/ProfilePictureField";
import { Images } from "@/lib/images";
import Image from "next/image";

export default function ClientOnboardingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = (params.get("email") || "").trim();
  const userName = (params.get("user") || "").trim();

  const [form, setForm] = useState({
    location: "",
    profilePicture: "",
    companyName: "",
    website: "",
    about: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to save");
      setMsg("Profile saved! Redirecting…");
      setTimeout(() => router.push("/"), 800);
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none ring-emerald-500 focus:ring-2";

  const previewCompany = useMemo(
    () => form.companyName || "Your company",
    [form.companyName]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* subtle emerald/cyan blobs (very light, on brand) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

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
        {/* header */}
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome, {userName || "Client"}{" "}
            <span className="align-middle">👋</span>
          </h1>
          <p className="text-sm text-slate-600">
            Tell us a bit about you to personalize your experience.
          </p>
        </div>

        {/* layout: form + preview */}
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_360px]">
          {/* form card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
          >
            <form onSubmit={onSubmit} className="grid gap-4">
              {/* Location */}
              <div className="grid gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  placeholder="City, Country"
                  className={inputClass}
                />
              </div>

              {/* Profile Picture (Cloudinary) */}
              <ProfilePictureField
                label="Profile Picture"
                value={form.profilePicture}
                onChange={(url) =>
                  setForm((f) => ({
                    ...f,
                    profilePicture: url,
                  }))
                }
              />

              {/* Company */}
              <div className="grid gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Company Name (optional)
                </label>
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={onChange}
                  className={inputClass}
                />
              </div>

              {/* Website */}
              <div className="grid gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Website (optional)
                </label>
                <input
                  name="website"
                  value={form.website}
                  onChange={onChange}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>

              {/* About */}
              <div className="grid gap-1">
                <label className="text-sm font-medium text-slate-700">
                  About
                </label>
                <textarea
                  name="about"
                  value={form.about}
                  onChange={onChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Briefly describe yourself or your company, goals and what you’re looking to achieve."
                />
              </div>

              <AnimatePresence>
                {err && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {err}
                  </motion.div>
                )}
                {msg && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
                  >
                    {msg}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-2 flex items-center justify-between">
                <a
                  href="/sign-up"
                  className="text-sm text-slate-600 underline-offset-2 hover:underline"
                >
                  Back to sign up
                </a>
                <button
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-70"
                >
                  {saving ? "Saving…" : "Save & Continue"}
                </button>
              </div>
            </form>
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
                    <h3 className="text-lg font-semibold text-slate-900 leading-tight">
                      {userName || "Your name"}
                    </h3>
                    <p className="text-xs text-slate-600">{previewCompany}</p>
                    <p className="text-xs text-slate-500">
                      {form.location || "Location"}
                    </p>
                  </div>
                </div>

                {form.about && (
                  <>
                    <div className="mt-5 text-xs uppercase tracking-wide text-slate-500">
                      About
                    </div>
                    <p className="mt-2 line-clamp-5 text-sm text-slate-700">
                      {form.about}
                    </p>
                  </>
                )}

                {(form.website || form.companyName) && (
                  <>
                    <div className="mt-5 text-xs uppercase tracking-wide text-slate-500">
                      Company
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      {form.companyName && (
                        <div className="text-slate-700">{form.companyName}</div>
                      )}
                      {form.website && (
                        <a
                          href={form.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 underline-offset-2 hover:underline"
                        >
                          {form.website}
                        </a>
                      )}
                    </div>
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

/* simple user icon – follows currentColor (keeps palette) */
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
