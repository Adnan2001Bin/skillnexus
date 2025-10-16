"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { popularServices } from "@/lib/freelance-categories";

export default function PopularServices() {
  const router = useRouter();

  const handleServiceClick = (service: { value: string; title: string }) => {
    // Updated to the new freelancers listing route
    router.push(
      `/find-freelancers?category=${encodeURIComponent(
        service.value
      )}&services=${encodeURIComponent(service.title)}`
    );
  };

  return (
    <section className="relative isolate overflow-hidden bg-gray-100 py-14 sm:py-16 ">
      {/* Ambient gradient blobs */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 font-sans">
        {/* Title */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-700 bg-clip-text text-transparent">
              Popular Services
            </span>
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Discover in-demand freelance services and jump straight into the
            right category.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative mt-10">
          <Carousel
            opts={{ align: "start", slidesToScroll: "auto" }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4">
              {popularServices.map((service) => (
                <CarouselItem
                  key={service.id}
                  className="pl-3 sm:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <button
                    onClick={() =>
                      handleServiceClick({
                        value: service.value,
                        title: service.title,
                      })
                    }
                    className="group block h-full w-full focus:outline-none"
                  >
                    <div
                      className="
                        relative flex h-[240px] w-full flex-col overflow-hidden rounded-2xl
                        border border-emerald-100/70 bg-white/70
                        shadow-[0_8px_30px_rgba(0,0,0,0.06)]
                        backdrop-blur-sm transition
                        hover:-translate-y-1 hover:shadow-[0_12px_34px_rgba(16,185,129,0.25)]
                        ring-1 ring-transparent hover:ring-emerald-200/80
                      "
                    >
                      {/* top: title */}
                      <div className="flex h-[34%] items-center justify-center bg-gradient-to-b from-emerald-900/90 to-emerald-800/80 px-4 text-center">
                        <h3 className="line-clamp-2 text-sm font-semibold text-white sm:text-base">
                          {service.title}
                        </h3>
                      </div>

                      {/* image */}
                      <div className="relative h-[66%]">
                        <div className="absolute inset-0">
                          <Image
                            src={service.icon}
                            alt={`${service.title} icon`}
                            fill
                            className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                          />
                        </div>

                        {/* light overlay on hover */}
                        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 bg-white" />

                        {/* corner shimmer */}
                        <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rotate-45 bg-gradient-to-br from-emerald-300/40 to-transparent blur-md" />
                      </div>
                    </div>
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* arrows (overlay on md+) */}
            <CarouselPrevious className="hidden md:flex -left-3 lg:-left-5" />
            <CarouselNext className="hidden md:flex -right-3 lg:-right-5" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
