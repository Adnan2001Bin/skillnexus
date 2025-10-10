// app/sign-in/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Images } from "@/lib/images";

const Blob = ({ delay = 0, className = "" }: { delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity: 0.35, scale: 1 }}
    transition={{ duration: 2.2, delay }}
    aria-hidden
    className={`pointer-events-none absolute blur-3xl ${className}`}
  />
);

export default function SignInPage() {
  const params = useSearchParams();
  const router = useRouter();
  const errorParam = params.get("error");
  const callbackUrl = params.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam) {
      // Map NextAuth error codes/messages
      const map: Record<string, string> = {
        CredentialsSignin: "Invalid email or password.",
      };
      setError(map[errorParam] || decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailNorm = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: emailNorm,
        password,
        callbackUrl,
      });

      if (!res) {
        setError("Sign in failed. Please try again.");
      } else if (res.error) {
        setError(res.error);
      } else {
        router.push(res.url || callbackUrl);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F9FAFB] text-[#1E293B]">
      {/* Animated blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="relative h-full w-full">
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(closest-side,white,transparent)]" />
          <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-[#1DBF73]/50 blur-3xl" />
          <div className="absolute right-[-10%] top-[-10%] h-72 w-72 rounded-full bg-[#4CC9F0]/50 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[20%] h-72 w-72 rounded-full bg-yellow-200/60 blur-3xl" />
          <div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-[#1DBF73]/60 blur-3xl" />
          <div className="motion-reduce:hidden">
            <Blob delay={0.1} className="left-[-10%] top-[-10%] h-72 w-72 bg-[#1DBF73]" />
            <Blob delay={0.3} className="right-[-10%] top-[-10%] h-72 w-72 bg-[#4CC9F0]" />
          </div>
        </div>
      </div>

      <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-8">
        {/* Left: Logo + tagline */}
        <section className="order-2 md:order-1">
          <div className="mb-4">
            <Image
              src={Images.logo}
              alt="Logo"
              width={160}
              height={44}
              className="object-contain"
              priority
            />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight md:text-5xl"
          >
            Welcome back 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-4 max-w-lg text-gray-600 md:text-lg"
          >
            Sign in to manage jobs, proposals, and messages. New here?{" "}
            <a href="/auth/register" className="text-[#1DBF73] underline">
              Create an account
            </a>
            .
          </motion.p>
        </section>

        {/* Right: Sign-in card */}
        <section className="order-1 md:order-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Sign in</h2>
                <div className="text-sm text-gray-500">Welcome back</div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-[#1E293B] outline-none ring-[#4CC9F0] transition focus:ring-2"
                    required
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <a href="/auth/forgot-password" className="text-xs text-[#1DBF73] hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-[#1E293B] outline-none ring-[#4CC9F0] transition focus:ring-2"
                    required
                  />
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
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#1DBF73] px-4 py-2.5 font-semibold text-white shadow transition hover:bg-[#179956] focus:outline-none focus:ring-2 focus:ring-[#4CC9F0] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="relative z-10">
                    {submitting ? "Signing in…" : "Sign in"}
                  </span>
                  <span className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-[#1DBF73]/30 to-[#4CC9F0]/30 transition group-hover:translate-y-0" />
                </button>

                <p className="text-center text-sm text-gray-600">
                  Don’t have an account?{" "}
                  <a href="/auth/register" className="font-medium text-[#1DBF73] hover:underline">
                    Sign up
                  </a>
                </p>
              </form>

              {/* Optional OAuth buttons (wire if enabled in NextAuth) */}
              {/* <div className="relative py-3 mt-3">
                <div className="h-px w-full bg-gray-200" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                  or
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button onClick={() => signIn("google")} className="...">Continue with Google</button>
                <button onClick={() => signIn("github")} className="...">Continue with GitHub</button>
              </div> */}
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
    </div>
  );
}
