// =====================================
// File: app/auth/verify/page.tsx (Client)
// =====================================
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Images } from "@/lib/images";

const Digit = ({ value, onChange, onKeyDown, innerRef, index }: any) => (
  <input
    ref={innerRef}
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={1}
    value={value}
    onChange={(e) => onChange(index, e.target.value)}
    onKeyDown={(e) => onKeyDown(index, e)}
    className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-center text-lg font-semibold tracking-widest text-slate-900 outline-none ring-emerald-500 transition focus:ring-2"
    aria-label={`Digit ${index + 1}`}
  />
);

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const initialEmail = (params.get("email") || "").trim();
  const initialUserName = (
    params.get("user") ||
    params.get("userName") ||
    ""
  ).trim();
  const role = (params.get("role") || "client") as
    | "client"
    | "freelancer"
  const [email, setEmail] = useState(initialEmail);
  const [userName, setUserName] = useState(initialUserName);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    refs.current[0]?.focus();
    return () => clearInterval(id);
  }, []);

  const handleOtpChange = (i: number, val: string) => {
    setError(null);
    const v = val.replace(/\D/g, "").slice(0, 1);
    setOtp((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };

const verify = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("Enter a valid email");
    return;
  }
  const code = otp.join("");
  if (code.length !== 6) {
    setError("Please enter the 6-digit code");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.toLowerCase(), code }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Verification failed");

    setSuccess(json?.message || "Email verified successfully.");

    // ➜ Do ONE navigation only
    if (role === "client") {
      router.replace(
        `/onboarding/client?email=${encodeURIComponent(email)}&user=${encodeURIComponent(userName)}`
      );
    } else {
      router.replace(
        `/onboarding/freelancer?email=${encodeURIComponent(email)}&user=${encodeURIComponent(userName)}`
      );
    }

    // ❌ remove this — it overrides your onboarding redirect
    // setTimeout(() => router.push("/sign-in"), 900);
  } catch (err: any) {
    setError(err.message || "Verification failed");
  } finally {
    setLoading(false);
  }
};

  const resend = async () => {
    if (timeLeft > 0) return;
    setError(null);
    setSuccess(null);
    if (!email || !userName) {
      setError("Email and username required to resend code");
      return;
    }
    try {
      const res = await fetch("/api/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), userName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Could not resend code");
      setSuccess(json?.message || "Code sent. Check your inbox.");
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(600);
      refs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Could not resend code");
    }
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-800">
      {/* background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="relative h-full w-full">
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(closest-side,white,transparent)]" />
          <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-emerald-300/50 blur-3xl" />
          <div className="absolute right-[-10%] top-[-10%] h-72 w-72 rounded-full bg-cyan-300/50 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[20%] h-72 w-72 rounded-full bg-yellow-200/60 blur-3xl" />
          <div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-emerald-200/60 blur-3xl" />
        </div>
      </div>

      <main className="mx-auto grid min-h-screen max-w-3xl grid-cols-1 items-center gap-8 px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-md">
            <div className="mx-auto mb-4 w-full max-w-md">
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
              <p className="text-sm text-slate-600">
                We’ve emailed a 6-digit code to{" "}
                <span className="font-medium">{email || "your inbox"}</span>.
              </p>
            </div>

            {/* Email / username editors (in case user came without qs) */}
            {!initialEmail && (
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 transition focus:ring-2"
                />
              </div>
            )}
            {!initialUserName && (
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Username
                </label>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="your_username"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 transition focus:ring-2"
                />
              </div>
            )}

            <form onSubmit={verify} className="space-y-5">
              <div className="flex justify-between gap-2">
                {otp.map((d, i) => (
                  <Digit
                    key={i}
                    index={i}
                    value={d}
                    onChange={handleOtpChange}
                    onKeyDown={handleOtpKeyDown}
                    innerRef={(el: any) => (refs.current[i] = el)}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <div>
                  Time left:{" "}
                  <span className="font-semibold text-slate-800">
                    {mm}:{ss}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resend}
                  disabled={timeLeft > 0}
                  className="font-medium text-emerald-700 enabled:hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {timeLeft > 0 ? "Resend available soon" : "Resend code"}
                </button>
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="relative z-10">
                  {loading ? "Verifying…" : "Verify email"}
                </span>
                <span className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 transition group-hover:translate-y-0" />
              </button>

              <p className="text-center text-xs text-slate-500">
                Entered the wrong email?{" "}
                <a
                  href="/sign-up"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  Go back
                </a>
              </p>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
