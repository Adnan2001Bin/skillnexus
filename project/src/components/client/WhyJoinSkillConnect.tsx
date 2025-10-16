"use client";

import Image from "next/image";
import {
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  Headphones,
  Gauge,
  Wallet,
} from "lucide-react";
import { Images } from "@/lib/images";

type Feature = {
  title: string;
  desc: string;
  icon?: React.ReactNode;
};

export default function WhyJoinNexus({
  features = defaultFeatures,
  personSrc = "/images/person.png", // replace with your asset if desired
  personAlt = "Happy freelancer using SkillNexus",
}: {
  features?: Feature[];
  personSrc?: string;
  personAlt?: string;
}) {
  return (
    <section
      className="
        relative isolate overflow-hidden
        bg-gradient-to-br from-white via-emerald-50/80 to-teal-50
        py-16 sm:py-20 
      "
    >
      {/* Ambient accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.emerald.300/.28),transparent_60%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.teal.300/.28),transparent_60%)] blur-2xl"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        {/* LEFT on desktop — Person over flipped blob */}
        <div className="relative mx-auto w-full max-w-lg order-2 lg:order-1">
          {/* Flipped blob */}
          <svg
            viewBox="0 0 600 600"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-auto w-full text-emerald-200 transform -scale-x-100"
          >
            <g transform="translate(300,300)">
              <path
                d="
                  M145 -181.5C184.7 -146.7 206.6 -93.1 206.3 -43.7C206 5.8 183.3 51 154.3 94.3C125.3 137.6 90 179 45.1 195.1C0.2 211.2 -54.4 201.9 -103.7 181C-153 160.1 -197.1 127.6 -215.5 83.6C-233.9 39.6 -226.7 -15.9 -206.2 -63.1C-185.7 -110.3 -151.9 -149.2 -111.6 -181.5C-71.4 -213.8 -35.7 -239.4 7.3 -249C50.3 -258.6 100.6 -252.2 145 -181.5Z
                "
                fill="currentColor"
                className="opacity-60"
              />
            </g>
          </svg>

          {/* Person image */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-[78%] w-[78%]">
              <Image
                src={Images.image1}
                alt={personAlt}
                fill
                className="object-contain drop-shadow-xl"
                priority={false}
              />
            </div>
          </div>
        </div>

        {/* RIGHT on desktop — Text & feature cards */}
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-700 bg-clip-text text-transparent">
              Why Join SkillNexus?
            </span>
          </h2>
          <p className="mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
            A safer, smarter way to hire Freelancers and grow your business —
            all in one place.
          </p>

          {/* Cards */}
          <div className="mt-8 grid gap-4 sm:gap-5 md:grid-cols-2">
            {features.map((f, i) => (
              <div
                key={i}
                className="
                  group relative overflow-hidden rounded-2xl border border-emerald-100/80
                  bg-white/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]
                  backdrop-blur-sm transition hover:-translate-y-1
                  hover:shadow-[0_14px_38px_rgba(16,185,129,0.20)]
                  ring-1 ring-transparent hover:ring-emerald-200/90
                "
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-70" />
                <div className="flex items-start gap-4">
                  <div
                    className="
                      grid h-12 w-12 shrink-0 place-items-center rounded-xl
                      bg-gradient-to-br from-emerald-600 to-teal-600 text-white
                      ring-1 ring-white/10 shadow-md
                    "
                  >
                    <span className="transition-transform duration-300 group-hover:scale-110">
                      {f.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {f.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {f.desc}
                    </p>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rotate-45 bg-gradient-to-br from-emerald-300/30 to-transparent blur-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const defaultFeatures: Feature[] = [
  {
    title: "Verified Freelancers",
    desc: "Profiles reviewed and approved so you can hire with confidence.",
    icon: <BadgeCheck className="h-6 w-6" />,
  },
  {
    title: "Secure Payments",
    desc: "Escrow-style flow and clear milestones keep both sides protected.",
    icon: <ShieldCheck className="h-6 w-6" />,
  },
  {
    title: "Smart Matching",
    desc: "Find the right expert fast with category, skills, and portfolio filters.",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    title: "Responsive Support",
    desc: "Get help when you need it — guidance, safety, and dispute assistance.",
    icon: <Headphones className="h-6 w-6" />,
  },
  {
    title: "Project Tracking",
    desc: "Keep everything on track with milestones, updates, and approvals.",
    icon: <Gauge className="h-6 w-6" />,
  },
  {
    title: "Fair Pricing",
    desc: "Compare packages, negotiate custom quotes, and pay only for results.",
    icon: <Wallet className="h-6 w-6" />,
  },
];
