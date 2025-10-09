"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Animated Sign-Up Page
 * - Responsive, accessible, and fast to implement in Next.js / CRA
 * - TailwindCSS + Framer Motion (no external UI kit required)
 * - Features: role switch, password strength meter, live validation, subtle animated bg
 * - Posts to /api/auth (adjust the endpoint to your route: /api/auth/register or similar)
 */

// ---- Helpers
const passwordScore = (pwd: string) => {
  let score = 0;
  if (!pwd) return 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  return Math.min(score, 5);
};

const strengthLabel = (score: number) => {
  return ["Very weak", "Weak", "Okay", "Good", "Strong", "Excellent"][score] || "";
};

const strengthColor = (score: number) => {
  return [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-lime-500",
    "bg-emerald-500",
    "bg-teal-500",
  ][score];
};

// ---- Animated Background Blob
const Blob = ({ delay = 0, className = "" }: { delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity: 0.35, scale: 1 }}
    transition={{ duration: 2.2, delay }}
    aria-hidden
    className={`pointer-events-none absolute blur-3xl ${className}`}
  />
);

export default function SignUpPage() {
  const [role, setRole] = useState<"user" | "talent">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ userName: "", email: "", password: "", confirm: "" });

  const pScore = useMemo(() => passwordScore(form.password), [form.password]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic client-side checks to complement server-side Zod
    if (!form.userName || form.userName.trim().length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: form.userName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Sign up failed");
      setSuccess(json?.message || "User registered successfully. Please verify your account.");
      setForm({ userName: "", email: "", password: "", confirm: "" });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-800">
      {/* Animated gradient blobs (respect reduced motion) */}
      <div className="absolute inset-0 -z-10">
        <div className="relative h-full w-full">
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(closest-side,white,transparent)]" />
          <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-emerald-300/50 blur-3xl" />
          <div className="absolute right-[-10%] top-[-10%] h-72 w-72 rounded-full bg-cyan-300/50 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[20%] h-72 w-72 rounded-full bg-yellow-200/60 blur-3xl" />
          <div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-emerald-200/60 blur-3xl" />
          <div className="sr-only">Decorative animated background</div>
          {/* Motion fade-in of blobs for users without reduced motion */}
          <div className="motion-reduce:hidden">
            <Blob delay={0.1} className="left-[-10%] top-[-10%] h-72 w-72 bg-emerald-300" />
            <Blob delay={0.3} className="right-[-10%] top-[-10%] h-72 w-72 bg-cyan-300" />
            <Blob delay={0.5} className="left-[20%] bottom-[-10%] h-72 w-72 bg-yellow-200" />
            <Blob delay={0.7} className="right-[10%] bottom-[10%] h-72 w-72 bg-emerald-200" />
          </div>
        </div>
      </div>

      <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-8">
        {/* Left: Pitch / Brand */}
        <section className="order-2 md:order-1">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl"
          >
            Join <span className="text-emerald-600">SkillConnect</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-4 max-w-md text-slate-600 md:text-lg"
          >
            Find world‑class talent or your next opportunity. Create your account in seconds and start collaborating.
          </motion.p>

          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            className="mt-8 space-y-3"
            aria-label="Key benefits"
          >
            {[
              "Verified professionals & transparent reviews",
              "Secure escrow payments and milestone tracking",
              "AI‑assisted matching for faster hiring",
            ].map((t, i) => (
              <motion.li
                key={i}
                variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}
                className="flex items-start gap-3"
              >
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">✓</span>
                <span className="text-slate-700">{t}</span>
              </motion.li>
            ))}
          </motion.ul>

          <div className="mt-10 hidden items-center gap-6 md:flex" aria-hidden>
            <div className="h-10 w-24 rounded bg-slate-200/70" />
            <div className="h-10 w-24 rounded bg-slate-200/70" />
            <div className="h-10 w-24 rounded bg-slate-200/70" />
          </div>
        </section>

        {/* Right: Sign Up Card */}
        <section className="order-1 md:order-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>
                <div className="text-sm text-slate-500">It takes less than a minute</div>
              </div>

              {/* Role switch */}
              <div className="mb-5 inline-flex overflow-hidden rounded-full border bg-slate-100 p-1" role="tablist" aria-label="Choose your role">
                {[
                  { key: "user", label: "Client" },
                  { key: "talent", label: "Freelancer" },
                ].map((r) => (
                  <button
                    key={r.key}
                    role="tab"
                    aria-selected={role === (r.key as any)}
                    onClick={() => setRole(r.key as any)}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      role === r.key
                        ? "rounded-full bg-white text-slate-900 shadow"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <form onSubmit={onSubmit} noValidate className="space-y-4">
                {/* Username */}
                <div>
                  <label htmlFor="userName" className="mb-1 block text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <input
                    id="userName"
                    name="userName"
                    autoComplete="username"
                    required
                    value={form.userName}
                    onChange={onChange}
                    placeholder="e.g. shahriar_11"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 transition focus:ring-2"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 transition focus:ring-2"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="text-xs font-medium text-emerald-700 hover:underline"
                      aria-pressed={showPwd}
                    >
                      {showPwd ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={onChange}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 transition focus:ring-2"
                  />

                  {/* Strength meter */}
                  <div className="mt-2">
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-full w-1/5 transition-all ${i < pScore ? strengthColor(pScore) : ""}`}
                        />
                      ))}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{strengthLabel(pScore)}</div>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-slate-700">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    name="confirm"
                    type={showPwd ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={form.confirm}
                    onChange={onChange}
                    placeholder="Re-enter your password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 transition focus:ring-2"
                  />
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <input id="terms" type="checkbox" required className="mt-1" />
                  <label htmlFor="terms">
                    I agree to the <a className="text-emerald-700 underline" href="#">Terms</a> and
                    <a className="ml-1 text-emerald-700 underline" href="#">Privacy Policy</a>.
                  </label>
                </div>

                {/* Error / Success */}
                <AnimatePresence initial={false}>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      role="status"
                      className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
                    >
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="relative z-10">{loading ? "Creating account…" : "Create account"}</span>
                  <span className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 transition group-hover:translate-y-0" />
                </button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="h-px w-full bg-slate-200" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-500">
                    or
                  </span>
                </div>

                {/* Social auth (wire up as needed) */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button type="button" className="flex items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.826 31.259 29.323 34 24 34c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 4.108 29.268 2 24 2 12.955 2 4 10.955 4 22s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.294 16.023 18.798 13 24 13c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 4.108 29.268 2 24 2 16.318 2 9.656 6.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 42c5.263 0 10.03-2.02 13.64-5.317l-6.3-5.318C29.275 33.986 26.773 35 24 35c-5.304 0-9.816-3.758-11.338-8.807l-6.55 5.046C9.422 39.556 16.161 42 24 42z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.128 3.276-4.07 5.917-7.303 5.917-5.304 0-9.816-3.758-11.338-8.807l-6.55 5.046C9.422 39.556 16.161 42 24 42c8.822 0 18-6.5 18-20 0-1.341-.138-2.651-.389-3.917z"/></svg>
                    Continue with Google
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.438 9.799 8.205 11.387.6.111.82-.261.82-.58 0-.286-.011-1.243-.017-2.255-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.758-1.333-1.758-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.304 3.492.997.108-.775.419-1.305.762-1.606-2.665-.303-5.466-1.332-5.466-5.93 0-1.311.469-2.381 1.235-3.221-.124-.303-.535-1.524.116-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.005.404 2.289-1.552 3.295-1.23 3.295-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.91 1.233 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.217.697.826.579C20.565 21.795 24 17.307 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    Continue with GitHub
                  </button>
                </div>

                <p className="text-center text-sm text-slate-600">
                  Already have an account? <a href="/auth/login" className="font-medium text-emerald-700 hover:underline">Log in</a>
                </p>
              </form>
            </div>

            {/* Tiny footnote */}
            <p className="mt-4 text-center text-xs text-slate-500">
              Protected by reCAPTCHA and the Google <a className="underline" href="#">Privacy Policy</a> and <a className="underline" href="#">Terms of Service</a> apply.
            </p>
          </motion.div>
        </section>
      </main>

      {/* Reduced motion preference */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .motion-reduce\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}