"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { A11y, Autoplay, EffectFade, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";

import { heroSlides } from "@/lib/hero-slides";
import { cn } from "cn";

// Swiper reads `new Date()` on init, which cannot be prerendered under
// Cache Components — the slider streams in behind this skeleton instead.
function HeroSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid animate-pulse items-center gap-12 pt-10 pb-40 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:pt-14 lg:pb-28"
    >
      <div className="flex flex-col items-start gap-7">
        <div className="h-3 w-44 rounded-full bg-muted" />
        <div className="h-12 w-4/5 rounded-md bg-muted" />
        <div className="h-12 w-3/5 rounded-md bg-muted" />
        <div className="h-4 w-full max-w-md rounded-full bg-muted" />
        <div className="h-4 w-2/3 max-w-sm rounded-full bg-muted" />
        <div className="mt-3 h-14 w-48 rounded-md bg-muted" />
      </div>
      <div className="relative mx-auto h-[460px] w-full max-w-[540px] sm:h-[560px] lg:h-[620px]">
        <div className="absolute inset-x-0 top-0 bottom-14 rounded-t-full bg-muted" />
      </div>
    </div>
  );
}

export default function Banner() {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [active, setActive] = useState(0);

  return (
    <section className="relative overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 right-[-12%] size-[620px] rounded-full bg-[radial-gradient(circle,rgba(179,144,91,0.14),transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(207,123,98,0.10),transparent_65%)]"
      />
      <div className="relative mx-auto w-full max-w-[1440px] px-6 lg:px-14">
        <Suspense fallback={<HeroSkeleton />}>
          <Swiper
          modules={[Autoplay, EffectFade, Keyboard, A11y]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={900}
          loop
          autoHeight
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          keyboard={{ enabled: true }}
          a11y={{
            prevSlideMessage: "Previous slide",
            nextSlideMessage: "Next slide",
          }}
          onSwiper={setSwiper}
          onSlideChange={(instance) => setActive(instance.realIndex)}
          className="w-full"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide
              key={slide.id}
              className="banner-slide overflow-hidden"
              inert={active !== index}
            >
              <div className="grid items-center gap-12 pt-10 pb-40 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:pt-1 lg:pb-20">
                {/* Copy */}
                <div className="banner-copy flex flex-col items-start">
                  <div className="flex items-center gap-4">
                    <span className="banner-line h-px w-10 bg-gold" aria-hidden="true" />
                    <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                      {slide.eyebrow}
                    </p>
                  </div>

                  <h1 className="font-heading mt-7 text-5xl leading-[1.06] font-medium tracking-tight text-balance text-foreground sm:text-6xl xl:text-[4.5rem]">
                    {slide.headlineStart}{" "}
                    <span className="text-primary italic">
                      {slide.headlineAccent}
                    </span>{" "}
                    {slide.headlineEnd}
                  </h1>

                  <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                    {slide.description}
                  </p>

                  <Link
                    href="/books"
                    className="mt-9 inline-flex h-14 items-center gap-3 rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/85"
                  >
                    Browse Books
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>

                {/* Imagery: arch photo + overlapping photo + book card */}
                <div className="relative mx-auto h-[460px] w-full max-w-[540px] sm:h-[560px] lg:h-[620px] mt-10">
                  <div className="banner-arch absolute inset-x-0 top-0 bottom-14 overflow-hidden rounded-t-full bg-muted">
                    <Image
                      src={slide.image.src}
                      alt={slide.image.alt}
                      fill
                      priority={index === 0}
                      sizes="(min-width: 1024px) 42vw, 90vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="banner-overlay absolute bottom-40 left-0 h-48 w-40 bg-card p-2 shadow-xl sm:-left-8 sm:h-56 sm:w-48">
                    <div className="relative size-full overflow-hidden">
                      <Image
                        src={slide.overlayImage.src}
                        alt={slide.overlayImage.alt}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="banner-card absolute right-0 bottom-0 flex w-72 max-w-[85%] items-center gap-4 bg-card p-4 shadow-xl sm:-right-6">
                    <div className="relative flex h-24 w-16 shrink-0 flex-col overflow-hidden rounded-xs bg-[#efe9dd] shadow-sm">
                      <span className="h-4 w-full bg-primary" />
                      <span className="font-heading px-1.5 pt-1.5 line-clamp-4 text-[7px] leading-tight text-foreground/80 italic">
                        {slide.book.title}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold tracking-[0.25em] text-gold uppercase">
                        Book of the month
                      </p>
                      <p className="font-heading mt-1.5 truncate text-lg leading-snug text-foreground">
                        {slide.book.title}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {slide.book.author}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          </Swiper>
        </Suspense>

        {/* Controls live outside the Swiper so they stay put while slides fade */}
        <div className="absolute bottom-10 left-6 z-20 flex items-center gap-5 lg:left-14">
          <button
            type="button"
            onClick={() => swiper?.slidePrev()}
            aria-label="Previous slide"
            className="flex size-11 items-center justify-center rounded-full border border-foreground/20 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => swiper?.slideNext()}
            aria-label="Next slide"
            className="flex size-11 items-center justify-center rounded-full border border-foreground/20 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>

          <div className="ml-1 flex items-center gap-4 sm:ml-2 sm:gap-5">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => swiper?.slideToLoop(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
                className="flex items-center gap-2.5 sm:gap-3"
              >
                <span
                  className={cn(
                    "text-xs tabular-nums transition-colors sm:text-sm",
                    index === active
                      ? "text-foreground"
                      : "text-foreground/50 hover:text-foreground",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "hidden h-px transition-all duration-300 sm:block",
                    index === active
                      ? "w-10 bg-gold"
                      : "w-6 bg-foreground/20",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
