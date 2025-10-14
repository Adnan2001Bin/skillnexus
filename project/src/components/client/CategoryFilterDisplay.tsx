"use client";

import Image, { StaticImageData } from "next/image";
import { categories } from "@/lib/freelance-categories";
import { Images } from "@/lib/images";

type Props = { categoryFilter: string };

type CategoryContent = {
  header: string;
  text: string;
  additionalText: string;
  image: StaticImageData;
  benefits?: string[];
};

const contentMap: Record<string, CategoryContent> = {
  all: {
    header: "Explore All Freelancers",
    text: "Browse a wide range of expert freelancers across all categories.",
    additionalText:
      "Discover pros in tech, design, marketing, content, and more—ready to help you move faster.",
    image: Images.fbg1,
    benefits: ["Match with the right expert", "Share your needs easily", "Simple, guided experience"],
  },
  programming_tech: {
    header: "Programming & Tech Excellence",
    text: "Build innovative software with top freelance engineers.",
    additionalText: "From apps to AI—ship faster with proven specialists.",
    image: Images.fbg1,
    benefits: ["Custom Software", "Rapid Delivery", "Ongoing Support"],
  },
  graphics_design: {
    header: "Graphics & Design Mastery",
    text: "Craft stunning visuals with freelance designers.",
    additionalText: "From logos to full brand systems—make it memorable.",
    image: Images.fbg2,
    benefits: ["Unique Designs", "Branding", "Quick Turnaround"],
  },
  digital_marketing: {
    header: "Digital Marketing Power",
    text: "Boost growth with freelance marketers.",
    additionalText: "SEO, social campaigns, and analytics—done right.",
    image: Images.fbg3,
    benefits: ["SEO", "Targeted Ads", "Analytics Insights"],
  },
  video_animation: {
    header: "Video & Animation Creativity",
    text: "Bring stories to life with freelance creators.",
    additionalText: "Explainers, promos, reels—captivate your audience.",
    image: Images.fbg4,
    benefits: ["High-Quality Videos", "Custom Animations", "Fast Editing"],
  },
  ai_services: {
    header: "AI Services Innovation",
    text: "Automate and scale with AI freelancers.",
    additionalText: "ML, data insights, and workflow automation.",
    image: Images.fbg5,
    benefits: ["Automation", "Data Analysis", "Smart Experiences"],
  },
  business: {
    header: "Business Growth Solutions",
    text: "Accelerate operations and strategy.",
    additionalText: "Get tailored help across finance and ops.",
    image: Images.fbg6,
    benefits: ["Strategic Planning", "Financial Advice", "Efficiency"],
  },
  writing_translation: {
    header: "Writing & Translation Expertise",
    text: "Words that convert—across languages.",
    additionalText: "From copy to localization, quality matters.",
    image: Images.fbg7,
    benefits: ["Multilingual", "SEO Content", "Fast Delivery"],
  },
  consulting: {
    header: "Consulting Insights",
    text: "Solve tough problems with seasoned consultants.",
    additionalText: "Industry knowledge, hands-on solutions.",
    image: Images.fbg8,
    benefits: ["Expertise", "Tailored Advice", "Proven Results"],
  },
};

export default function CategoryFilterDisplay({ categoryFilter }: Props) {
  const selected =
    categoryFilter !== "all" ? categories.find((c) => c.value === categoryFilter) : undefined;
  const c = contentMap[categoryFilter] || contentMap.all;

  return (
    <div className="container mx-auto mt-16 px-4">
      {/* Outer gradient aura */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/25 via-teal-500/25 to-cyan-500/25 p-[1px]">
        {/* Glass card */}
        <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/15">
          {/* soft glow blobs */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-20 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl" />

          <div className="relative grid grid-cols-1 items-center gap-10 p-6 text-white md:grid-cols-2 md:p-10">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/20">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" />{" "}
                {selected?.label || "All Categories"}
              </div>

              <h2 className="mt-3 text-3xl font-bold leading-tight drop-shadow sm:text-4xl md:text-5xl">
                {c.header}
              </h2>

              <p className="mt-3 max-w-xl text-base text-white/85 sm:text-lg">{c.text}</p>
              <p className="mt-2 max-w-xl text-base text-white/80 sm:text-lg">{c.additionalText}</p>

              {c.benefits?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {c.benefits.map((b, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-sm ring-1 ring-white/20"
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      {b}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Right: image with frame */}
            <div className="relative">
              {/* framed container */}
              <div className="relative mx-auto aspect-video w-full max-w-lg overflow-hidden rounded-2xl ring-1 ring-white/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-black/10" />
                <Image
                  src={c.image}
                  alt={selected ? `${selected.label} preview` : "All categories preview"}
                  fill
                  className="object-cover"
                  priority
                />
                {/* subtle bottom bar */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 to-transparent p-3 text-right text-xs text-white/80">
                  Curated freelancers • {selected?.label || "All"}
                </div>
              </div>

              {/* floating label */}
              <div className="absolute -bottom-4 left-6">
                <div className="rounded-xl bg-white/15 px-3 py-2 text-xs text-white ring-1 ring-white/20 backdrop-blur">
                  Hand-picked & reviewed
                </div>
              </div>

              {/* decorative corner chip */}
              <div className="absolute -top-4 right-6">
                <div className="rounded-full bg-emerald-400/30 px-3 py-1 text-xs text-white ring-1 ring-white/20 backdrop-blur">
                  Pro Freelancers
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  );
}
