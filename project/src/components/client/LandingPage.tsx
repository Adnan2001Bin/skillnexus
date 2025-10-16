// src/components/client/WhyJoinSkillConnect.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Users,
  ShieldCheck,
  Rocket,
  Handshake,
  Gauge,
} from "lucide-react";
import { Images } from "@/lib/images"; // Make sure Images.freelancerHero exists (or replace src below)

export default function LandingPage() {
  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        py-16 md:py-24
        font-sans
      "
      // Distinct background from "Popular Services"
      style={{
        background:
          "linear-gradient(135deg, #EAF7F1 0%, #F9FEFC 35%, #F3F7FF 100%)",
      }}
    >

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 ring-1 ring-emerald-200">
              <BadgeCheck className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-wide">SkillNexus</span>
            </div>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Grow faster with a platform built for{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Freelancers
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-slate-600 sm:text-lg">
              Discover opportunities, get paid securely, and manage your work
              with ease. SkillConnect matches you with serious clients, equips
              you with pro tools, and supports your journey end-to-end.
            </p>

            {/* Cards grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <FeatureCard
                icon={<Users className="h-5 w-5" />}
                title="Qualified Clients"
                text="Access a steady stream of vetted projects from businesses that value quality."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Secure Payments"
                text="Milestone & escrow options ensure you’re paid reliably and on time."
              />
              <FeatureCard
                icon={<Rocket className="h-5 w-5" />}
                title="Boosted Visibility"
                text="Stand out with badges, portfolios, and skill tags designed to convert."
              />
              <FeatureCard
                icon={<Gauge className="h-5 w-5" />}
                title="Pro Tools"
                text="Proposals, contracts, chat, and analytics — all in one simple workspace."
              />
            </div>

            {/* Bottom row bullets */}
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              <Bullet text="Flexible pricing (hourly or fixed)" />
              <Bullet text="Ratings & reviews that build trust" />
              <Bullet text="Simple dispute assistance" />
              <Bullet text="Global client base" />
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
               <button
              className="
                inline-flex items-center justify-center rounded-xl
                bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white
                shadow-lg shadow-slate-900/10 transition
                hover:-translate-y-[2px] hover:bg-black focus:outline-none focus:ring-2 focus:ring-emerald-500
              "
            >
              View more
            </button>

            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="relative z-0 mx-auto w-full max-w-xl"
          >

            <div className="relative">
              <Blob className="absolute -inset-6 -z-10 text-emerald-200/60" />
              <div className="relative overflow-hidden rounded-3xl ring-1 ring-emerald-200/60 shadow-xl">
                <Image
                  src={Images.image2 }
                  alt="Happy freelancer"
                  width={900}
                  height={900}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>

              {/* Floating stat card */}
              <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-emerald-100 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-emerald-600" />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-900">1,200+ hires</div>
                    <div className="text-slate-600">last 30 days</div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute right-4 top-4 rounded-full bg-emerald-600/90 px-4 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-emerald-500/50">
                Top Rated Pros
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* -------- Small UI bits -------- */

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-200">
        {icon}
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-700">
      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
      {text}
    </li>
  );
}

/**
 * Simple SVG blob (Blob Maker style). Color comes from parent via currentColor.
 */
function Blob({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-auto w-full ${className}`}
    >
      <g transform="translate(300,300)">
        <path
          d="M129.6,-181.9C163.9,-161.8,183.5,-123.7,205.7,-83.8C227.9,-43.9,252.7,-2.3,250.2,38.4C247.7,79.2,217.9,119.2,185.7,159.3C153.4,199.5,118.7,239.7,76.2,253.6C33.8,267.5,-16.4,255.1,-62.2,239.1C-108,223.1,-149.5,203.5,-179.8,173.2C-210.1,142.9,-229.2,101.8,-237.4,58.9C-245.6,15.9,-242.8,-28.9,-228.1,-69.4C-213.3,-109.9,-186.6,-146.1,-150.9,-167.5C-115.2,-189,-71.5,-195.7,-29.8,-200.4C12,-205.1,24,-207.9,57.3,-197.3C90.6,-186.8,145.3,-163.9,129.6,-181.9Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
