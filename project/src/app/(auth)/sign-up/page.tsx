"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Images } from "@/lib/images";
import { useRouter } from "next/navigation";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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
  return (
    ["Very weak", "Weak", "Okay", "Good", "Strong", "Excellent"][score] || ""
  );
};

const strengthColor = (score: number) => {
  return [
    "bg-[#EF4444]", // Danger
    "bg-orange-400",
    "bg-yellow-400",
    "bg-lime-500",
    "bg-[#1DBF73]", // Success
    "bg-[#4CC9F0]", // Accent
  ][score];
};

// ---- Animated Background Blob
const Blob = ({
  delay = 0,
  className = "",
}: {
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity: 0.35, scale: 1 }}
    transition={{ duration: 2.2, delay }}
    aria-hidden
    className={`pointer-events-none absolute blur-3xl ${className}`}
  />
);

export default function SignUpPage() {
  const [role, setRole] = useState<"client" | "freelancer" | "admin">("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [nameChecking, setNameChecking] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<null | boolean>(null);
  const [nameMsg, setNameMsg] = useState<string>("");

  const debouncedUserName = useDebounce(form.userName, 400);
  const pScore = useMemo(() => passwordScore(form.password), [form.password]);
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const value = debouncedUserName.trim();
    setNameMsg("");

    if (!value) {
      setNameAvailable(null);
      setNameChecking(false);
      return;
    }
    if (value.length < 2) {
      setNameAvailable(false);
      setNameMsg("Username must be at least 2 characters");
      return;
    }

    const ctrl = new AbortController();
    setNameChecking(true);

    async function checkUsername() {
      try {
        const res = await fetch(
          `/api/username?userName=${encodeURIComponent(value)}`,
          { signal: ctrl.signal }
        );
        const json = await res.json();
        if (json?.success) {
          setNameAvailable(true);
          setNameMsg("Username is available");
        } else {
          setNameAvailable(false);
          setNameMsg(json?.message || "Username is taken");
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setNameAvailable(null);
          setNameMsg("Could not check username");
        }
      } finally {
        setNameChecking(false);
      }
    }

    checkUsername();

    return () => {
      ctrl.abort();
    };
  }, [debouncedUserName]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.userName || form.userName.trim().length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }
    if (!nameAvailable) {
      setError("Username is not available");
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
      setSuccess(
        json?.message ||
          "User registered successfully. Please verify your account."
      );
      router.push(
        `/verify?email=${encodeURIComponent(
          form.email.trim().toLowerCase()
        )}&user=${encodeURIComponent(form.userName.trim())}&role=${role}`
      );
      setForm({ userName: "", email: "", password: "", confirm: "" });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F9FAFB] text-[#1E293B] font-sans">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="relative h-full w-full">
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(closest-side,white,transparent)]" />
          <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-[#1DBF73]/50 blur-3xl" />
          <div className="absolute right-[-10%] top-[-10%] h-72 w-72 rounded-full bg-[#4CC9F0]/50 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[20%] h-72 w-72 rounded-full bg-yellow-200/60 blur-3xl" />
          <div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-[#1DBF73]/60 blur-3xl" />
          <div className="sr-only">Decorative animated background</div>
          <div className="motion-reduce:hidden">
            <Blob
              delay={0.1}
              className="left-[-10%] top-[-10%] h-72 w-72 bg-[#1DBF73]"
            />
            <Blob
              delay={0.3}
              className="right-[-10%] top-[-10%] h-72 w-72 bg-[#4CC9F0]"
            />
            <Blob
              delay={0.5}
              className="left-[20%] bottom-[-10%] h-72 w-72 bg-yellow-200"
            />
            <Blob
              delay={0.7}
              className="right-[10%] bottom-[10%] h-72 w-72 bg-[#1DBF73]"
            />
          </div>
        </div>
      </div>

      <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-8">
        {/* Left: Pitch / Brand */}
        <section className="order-2 md:order-1">
          <div className="flex-shrink-0 mb-3">
            <Image
              src={Images.logo}
              alt="Logo"
              width={150}
              height={40}
              className="object-contain"
              priority
            />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-[#1E293B] md:text-5xl"
          >
            Hire smarter. Work happier.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-4 max-w-lg text-gray-600 md:text-lg"
          >
            The marketplace where clients meet verified talent. Post jobs,
            receive proposals, and collaborate with confidence—backed by secure
            payments and transparent reviews.
          </motion.p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1DBF73] text-white">
                ✓
              </span>
              Secure escrow
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1DBF73] text-white">
                ✓
              </span>
              Verified identity
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1DBF73] text-white">
                ✓
              </span>
              Smart matching
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-10 hidden w-full md:block"
            aria-hidden
          >
            <div className="relative mx-auto w-full">
              <svg viewBox="0 0 560 360" className="h-auto w-full">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1DBF73" />
                    <stop offset="100%" stopColor="#4CC9F0" />
                  </linearGradient>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="560"
                  height="360"
                  rx="18"
                  fill="#0A0F26"
                />
                <g opacity="0.08">
                  <circle cx="80" cy="80" r="60" fill="url(#g1)" />
                  <circle cx="520" cy="40" r="40" fill="url(#g1)" />
                  <circle cx="460" cy="300" r="70" fill="url(#g1)" />
                </g>
                <rect
                  x="40"
                  y="40"
                  width="480"
                  height="50"
                  rx="10"
                  fill="#111827"
                  stroke="#1E293B"
                />
                <rect
                  x="60"
                  y="55"
                  width="120"
                  height="20"
                  rx="6"
                  fill="#1DBF73"
                />
                <rect
                  x="200"
                  y="55"
                  width="80"
                  height="20"
                  rx="6"
                  fill="#4CC9F0"
                />
                <rect
                  x="290"
                  y="55"
                  width="60"
                  height="20"
                  rx="6"
                  fill="#4CC9F0"
                />
                <rect
                  x="40"
                  y="110"
                  width="320"
                  height="200"
                  rx="14"
                  fill="#0A0F26"
                  stroke="#1E293B"
                />
                <rect
                  x="60"
                  y="130"
                  width="180"
                  height="16"
                  rx="6"
                  fill="#e2e8f0"
                />
                <rect
                  x="60"
                  y="154"
                  width="240"
                  height="10"
                  rx="5"
                  fill="#94a3b8"
                />
                <rect
                  x="60"
                  y="180"
                  width="240"
                  height="46"
                  rx="10"
                  fill="#0A0F26"
                  stroke="#1E293B"
                />
                <rect
                  x="66"
                  y="188"
                  width="120"
                  height="30"
                  rx="8"
                  fill="#1DBF73"
                />
                <rect
                  x="194"
                  y="188"
                  width="100"
                  height="30"
                  rx="8"
                  fill="#4CC9F0"
                />
                <rect
                  x="380"
                  y="110"
                  width="140"
                  height="200"
                  rx="14"
                  fill="#0A0F26"
                  stroke="#1E293B"
                />
                <circle cx="450" cy="152" r="28" fill="#1DBF73" />
                <rect
                  x="410"
                  y="190"
                  width="80"
                  height="10"
                  rx="5"
                  fill="#e2e8f0"
                />
                <rect
                  x="404"
                  y="208"
                  width="92"
                  height="7"
                  rx="4"
                  fill="#94a3b8"
                />
                <rect
                  x="404"
                  y="228"
                  width="92"
                  height="7"
                  rx="4"
                  fill="#94a3b8"
                />
              </svg>
            </div>
          </motion.div>
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
                <h2 className="text-xl font-semibold text-[#1E293B]">
                  Create your account
                </h2>
                <div className="text-sm text-gray-500">
                  It takes less than a minute
                </div>
              </div>

              <div
                className="mb-5 inline-flex overflow-hidden rounded-full border bg-gray-100 p-1"
                role="tablist"
                aria-label="Choose your role"
              >
                {(
                  [
                    { key: "client", label: "Client" },
                    { key: "freelancer", label: "Freelancer" },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.key}
                    role="tab"
                    aria-selected={role === r.key}
                    onClick={() => setRole(r.key)}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      role === r.key
                        ? "rounded-full bg-white text-[#1E293B] shadow"
                        : "text-gray-600 hover:text-[#1E293B]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <div>
                  <label
                    htmlFor="userName"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
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
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-[#1E293B] outline-none ring-[#4CC9F0] transition focus:ring-2"
                  />
                  <div className="mt-1 text-xs">
                    {nameChecking && (
                      <span className="text-gray-500">Checking...</span>
                    )}
                    {!nameChecking && nameMsg && (
                      <span
                        className={
                          nameAvailable ? "text-[#22C55E]" : "text-[#EF4444]"
                        }
                      >
                        {nameMsg}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
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
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-[#1E293B] outline-none ring-[#4CC9F0] transition focus:ring-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="text-xs font-medium text-[#1DBF73] hover:underline"
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
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-[#1E293B] outline-none ring-[#4CC9F0] transition focus:ring-2"
                  />
                  <div className="mt-2">
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-full w-1/5 transition-all ${
                            i < pScore ? strengthColor(pScore) : ""
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {strengthLabel(pScore)}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
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
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-[#1E293B] outline-none ring-[#4CC9F0] transition focus:ring-2"
                  />
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <input id="terms" type="checkbox" required className="mt-1" />
                  <label htmlFor="terms">
                    I agree to the{" "}
                    <a className="text-[#1DBF73] underline" href="#">
                      Terms
                    </a>{" "}
                    and
                    <a className="ml-1 text-[#1DBF73] underline" href="#">
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                <AnimatePresence initial={false}>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      role="alert"
                      className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/10 p-3 text-sm text-[#EF4444]"
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
                      className="rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/10 p-3 text-sm text-[#22C55E]"
                    >
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading || nameChecking || nameAvailable === false}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#1DBF73] px-4 py-2.5 font-semibold text-white shadow transition hover:bg-[#179956] focus:outline-none focus:ring-2 focus:ring-[#4CC9F0] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="relative z-10">
                    {loading ? "Creating account…" : "Create account"}
                  </span>
                  <span className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-[#1DBF73]/30 to-[#4CC9F0]/30 transition group-hover:translate-y-0" />
                </button>

                <div className="relative py-2">
                  <div className="h-px w-full bg-gray-200" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                    or
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
                      <path
                        fill="#FFC107"
                        d="M43.611 20.083H42V20H24v8h11.303C33.826 31.259 29.323 34 24 34c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 4.108 29.268 2 24 2 12.955 2 4 10.955 4 22s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306 14.691l6.571 4.817C14.294 16.023 18.798 13 24 13c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 4.108 29.268 2 24 2 16.318 2 9.656 6.337 6.306 14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 42c5.263 0 10.03-2.02 13.64-5.317l-6.3-5.318C29.275 33.986 26.773 35 24 35c-5.304 0-9.816-3.758-11.338-8.807l-6.55 5.046C9.422 39.556 16.161 42 24 42z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611 20.083H42V20H24v8h11.303c-1.128 3.276-4.07 5.917-7.303 5.917-5.304 0-9.816-3.758-11.338-8.807l-6.55 5.046C9.422 39.556 16.161 42 24 42c8.822 0 18-6.5 18-20 0-1.341-.138-2.651-.389-3.917z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.438 9.799 8.205 11.387.6.111.82-.261.82-.58 0-.286-.011-1.243-.017-2.255-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.758-1.333-1.758-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.304 3.492.997.108-.775.419-1.305.762-1.606-2.665-.303-5.466-1.332-5.466-5.93 0-1.311.469-2.381 1.235-3.221-.124-.303-.535-1.524.116-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.005.404 2.289-1.552 3.295-1.23 3.295-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.91 1.233 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.217.697.826.579C20.565 21.795 24 17.307 24 12c0-6.63-5.37-12-12-12z"
                      />
                    </svg>
                    Continue with GitHub
                  </button>
                </div>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <a
                    href="/auth/login"
                    className="font-medium text-[#1DBF73] hover:underline"
                  >
                    Log in
                  </a>
                </p>
              </form>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Protected by reCAPTCHA and the Google{" "}
              <a className="underline" href="#">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a className="underline" href="#">
                Terms of Service
              </a>{" "}
              apply.
            </p>
          </motion.div>
        </section>
      </main>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .motion-reduce\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
