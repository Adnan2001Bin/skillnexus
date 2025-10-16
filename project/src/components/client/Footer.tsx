// src/components/common/Footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, Twitter, Github, Linkedin, Instagram, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Images } from "@/lib/images";

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  const minimalPaths = new Set([
    "/sign-in",
    "/sign-up",
    "/onboarding/client",
    "/onboarding/freelancer",
  ]);
  const isMinimal = minimalPaths.has(pathname || "");

  if (isMinimal) {
    return (
      <footer className="mt-10 bg-emerald-950 pb-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-emerald-800/60 pt-6 text-sm text-emerald-200 sm:flex-row sm:mt-6">
            <p>© {year} SkillNexus. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <Badge>Safe Pay</Badge>
              <Badge>Verified Talent</Badge>
              <Badge>24/7 Support</Badge>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative isolate mt-20 border-t border-emerald-900/40 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-40 w-full max-w-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.emerald.500/.25),transparent_60%)] blur-3xl sm:h-56"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        {/* Top: brand + newsletter */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div>
            <div className="flex items-center gap-3">
              {/* <Image src={Images.logo} alt="SkillNexus" width={140} height={36} className="h-9 w-auto" /> */}
              <div className="text-2xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                  Skill
                </span>
                <span className="text-emerald-50">Nexus</span>
              </div>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-6 text-emerald-200/90 sm:text-base">
              Match with verified Freelancers, manage projects, and pay securely — all in one place.
            </p>

            {/* Socials */}
            <div className="mt-5 flex items-center gap-3">
              <Social href="https://twitter.com/" label="Twitter">
                <Twitter className="h-4 w-4" />
              </Social>
              <Social href="https://github.com/" label="GitHub">
                <Github className="h-4 w-4" />
              </Social>
              <Social href="https://www.linkedin.com/" label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </Social>
              <Social href="https://instagram.com/" label="Instagram">
                <Instagram className="h-4 w-4" />
              </Social>
            </div>
          </div>

          {/* Newsletter */}
          <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/40 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-emerald-300" />
              <h3 className="text-base font-semibold text-emerald-50">
                Stay in the loop
              </h3>
            </div>
            <p className="mt-2 text-sm text-emerald-200/90">
              Product updates, tips, and curated gigs. No spam.
            </p>
            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: hook up your submit logic
              }}
            >
              <Input
                type="email"
                required
                placeholder="your@email.com"
                className="h-10 flex-1 bg-emerald-950/50 border-emerald-800/60 text-emerald-50 placeholder:text-emerald-300/60"
                aria-label="Email address"
              />
              <Button
                type="submit"
                className="h-10 px-4 sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Send className="mr-2 h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Subscribe</span>
              </Button>
            </form>
            <p className="mt-2 text-xs text-emerald-300/80">
              By subscribing, you agree to our{" "}
              <Link href="/legal/terms" className="underline decoration-emerald-400/70 underline-offset-2 hover:text-emerald-200">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="underline decoration-emerald-400/70 underline-offset-2 hover:text-emerald-200">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-5">
          <LinkGroup
            title="Product"
            links={[
              { label: "Find Freelancers", href: "/find-freelancers" },
              { label: "Jobs", href: "/jobs" },
              { label: "Categories", href: "/categories" },
              { label: "Pricing", href: "/pricing" },
            ]}
          />
          <LinkGroup
            title="Clients"
            links={[
              { label: "How it works", href: "/how-it-works" },
              { label: "Enterprise", href: "/enterprise" },
              { label: "Success stories", href: "/stories" },
              { label: "Help & support", href: "/support" },
            ]}
          />
          <LinkGroup
            title="Freelancers"
            links={[
              { label: "Become a freelancer", href: "/freelancers/join" },
              { label: "Community", href: "/community" },
              { label: "Guides", href: "/guides" },
              { label: "Resources", href: "/resources" },
            ]}
          />
          <LinkGroup
            title="Company"
            links={[
              { label: "About", href: "/about" },
              { label: "Careers", href: "/careers" },
              { label: "Press", href: "/press" },
              { label: "Contact", href: "/contact" },
            ]}
          />
          <LinkGroup
            title="Legal"
            links={[
              { label: "Terms", href: "/legal/terms" },
              { label: "Privacy", href: "/legal/privacy" },
              { label: "Cookies", href: "/legal/cookies" },
              { label: "Security", href: "/legal/security" },
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-emerald-800/60 pt-6 text-sm text-emerald-200 sm:flex-row">
          <p>© {year} SkillNexus. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Badge>Safe Pay</Badge>
            <Badge>Verified Talent</Badge>
            <Badge>24/7 Support</Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Small subcomponents ---------- */

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      aria-label={label}
      href={href}
      target="_blank"
      className="grid h-9 w-9 place-items-center rounded-full border border-emerald-800/60 bg-emerald-900/40 text-emerald-200 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/70 hover:text-emerald-100"
    >
      {children}
    </Link>
  );
}

function LinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-base font-semibold text-emerald-50">{title}</h4>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-emerald-200/90 transition hover:text-emerald-100"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-emerald-800/60 bg-emerald-900/40 px-2 py-1 text-xs font-medium text-emerald-100 shadow-sm sm:px-3">
      {children}
    </span>
  );
}
