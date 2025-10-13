"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export type PortfolioCard = {
  title: string;
  description: string;
  imageUrl?: string | null;
  projectUrl?: string | null;
};

export default function PortfolioCarousel({ items }: { items: PortfolioCard[] }) {
  if (!items?.length) return null;

  return (
    <Carousel className="w-full" opts={{ align: "start", loop: true }}>
      <CarouselContent>
        {items.map((it, idx) => (
          <CarouselItem key={`${it.title}-${idx}`} className="md:basis-1/2 lg:basis-1/3">
            <div className="h-full rounded-xl border border-slate-200 p-3">
              {it.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.imageUrl}
                  alt={it.title || `Portfolio item ${idx + 1}`}
                  className="mb-2 h-44 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="mb-2 flex h-44 w-full items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  No image
                </div>
              )}
              <div className="line-clamp-1 font-medium text-slate-900">{it.title}</div>
              <div className="line-clamp-3 text-sm text-slate-600">{it.description}</div>
              {it.projectUrl && (
                <a
                  href={it.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-emerald-700 underline"
                >
                  View project
                </a>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-3 flex items-center justify-end gap-2">
        <CarouselPrevious className="static translate-x-0 translate-y-0" />
        <CarouselNext className="static translate-x-0 translate-y-0" />
      </div>
    </Carousel>
  );
}
