"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { GalleryDisplayItem } from "../types";

type GalleryGridProps = {
  items: GalleryDisplayItem[];
};

type GsapContext = ReturnType<(typeof import("gsap"))["gsap"]["context"]>;

const GRID_IMAGE_SIZES =
  "(min-width: 1536px) 20vw, (min-width: 1280px) 22vw, (min-width: 1024px) 26vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw";

const PREVIEW_IMAGE_SIZES =
  "(min-width: 1536px) 60vw, (min-width: 1024px) 72vw, (min-width: 768px) 80vw, 92vw";

const BLUR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='50' x2='50' y2='0'%3E%3Cstop stop-color='%23fdf2f8'/%3E%3Cstop offset='1' stop-color='%23fee2e2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='50' height='50' rx='12' fill='url(%23g)'/%3E%3C/svg%3E";

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isModalImageReady, setIsModalImageReady] = useState(false);
  const gridRef = useRef<HTMLUListElement>(null);

  const handleOpen = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((prevIndex) => {
      if (prevIndex === null || items.length === 0) {
        return prevIndex;
      }

      return prevIndex === 0 ? items.length - 1 : prevIndex - 1;
    });
  }, [items.length]);

  const showNext = useCallback(() => {
    setActiveIndex((prevIndex) => {
      if (prevIndex === null || items.length === 0) {
        return prevIndex;
      }

      return prevIndex === items.length - 1 ? 0 : prevIndex + 1;
    });
  }, [items.length]);

  const isOpen = activeIndex !== null;
  const activeItem = isOpen ? items[activeIndex] : null;
  const hasMultipleItems = items.length > 1;
  const activePositionLabel = activeIndex !== null ? `${activeIndex + 1} / ${items.length}` : null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, showNext, showPrevious]);

  useEffect(() => {
    if (activeIndex === null || items.length < 2 || typeof window === "undefined") {
      return;
    }

    const preloadTarget = (targetIndex: number) => {
      const targetItem = items[targetIndex];
      if (!targetItem) {
        return;
      }

      const preloader = new window.Image();
      preloader.src = targetItem.galleryUrl;
    };

    const nextIndex = (activeIndex + 1) % items.length;
    const previousIndex = (activeIndex - 1 + items.length) % items.length;

    preloadTarget(nextIndex);
    preloadTarget(previousIndex);
  }, [activeIndex, items]);

  useEffect(() => {
    if (activeIndex === null) {
      setIsModalImageReady(false);
      return;
    }

    setIsModalImageReady(false);
  }, [activeIndex]);

  const handleModalImageReady = useCallback(() => {
    setIsModalImageReady(true);
  }, []);

  useEffect(() => {
    let ctx: GsapContext | null = null;
    let isCancelled = false;

    const runAnimation = async () => {
      if (!gridRef.current || items.length === 0) {
        return;
      }

      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const { gsap } = await import("gsap");
      if (!gridRef.current || isCancelled) {
        return;
      }

      ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-gallery-card]",
          { opacity: 0, y: 32, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.75,
            stagger: 0.08,
            ease: "power2.out",
          },
        );
      }, gridRef);
    };

    void runAnimation();

    return () => {
      isCancelled = true;
      ctx?.revert();
    };
  }, [items.length]);

  if (items.length === 0) {
    return (
      <p className="text-center text-base text-slate-600">
        We are curating new moments for you. Check back soon.
      </p>
    );
  }

  return (
    <>
      <div className="rounded-[2rem] border border-slate-100/80 bg-gradient-soft p-4 shadow-soft sm:p-6">
        <ul
          ref={gridRef}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {items.map((item, index) => {
            const shouldPrioritize = index === 0;
            const captionId = item.caption ? `gallery-caption-${item.id}` : undefined;
            const ariaLabel = item.caption
              ? `${item.gCategory}: ${item.caption}`
              : `${item.gCategory} from Flamingo Café`;

            return (
              <li key={item.id} className="relative">
                <button
                  type="button"
                  data-gallery-card
                  aria-label={`Open ${ariaLabel} preview`}
                  aria-describedby={captionId}
                  onClick={() => handleOpen(index)}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/50 bg-slate-900/5 text-left shadow-soft transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <Image
                    src={item.galleryUrl}
                    alt={item.caption ?? `${item.gCategory} at Flamingo Café`}
                    fill
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] group-focus-visible:scale-[1.05] motion-reduce:transition-none"
                    sizes={GRID_IMAGE_SIZES}
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    priority={shouldPrioritize}
                    loading={shouldPrioritize ? "eager" : "lazy"}
                    fetchPriority={shouldPrioritize ? "high" : "auto"}
                  />
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-slate-950/75 via-slate-900/5 to-transparent p-4 text-white opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="inline-flex w-fit items-center rounded-full bg-white/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-900">
                      {item.gCategory}
                    </span>
                    {item.caption && (
                      <p
                        id={captionId}
                        className="text-sm font-semibold leading-snug text-white drop-shadow-lg"
                      >
                        {item.caption}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(openValue) => {
          if (!openValue) {
            handleClose();
          }
        }}
      >
        <DialogContent
          aria-label="Gallery image preview"
          className="w-[92vw] max-w-5xl border-none bg-transparent p-0 shadow-none sm:rounded-[2.5rem]"
        >
          {activeItem && (
            <div className="overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/95 shadow-elegant backdrop-blur-xl">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
                <Image
                  key={activeItem.id}
                  src={activeItem.galleryUrl}
                  alt={activeItem.caption ?? `${activeItem.gCategory} at Flamingo Café`}
                  fill
                  className={cn(
                    "object-cover transition-all duration-500 ease-out will-change-transform",
                    isModalImageReady ? "scale-100 opacity-100" : "scale-[1.02] opacity-0",
                  )}
                  sizes={PREVIEW_IMAGE_SIZES}
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  loading="eager"
                  onLoadingComplete={handleModalImageReady}
                />
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5 text-slate-900 sm:flex-nowrap sm:items-center">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                    {activeItem.gCategory}
                  </p>
                  {activeItem.caption ? (
                    <p className="mt-2 text-lg font-semibold leading-snug text-slate-900">
                      {activeItem.caption}
                    </p>
                  ) : (
                    <p className="mt-2 text-base text-slate-600">
                      A closer look at our {activeItem.gCategory.toLowerCase()}
                    </p>
                  )}
                </div>

                {hasMultipleItems && (
                  <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                    <span
                      className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400"
                      aria-live="polite"
                    >
                      {activePositionLabel}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-900/40 text-slate-900 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                      onClick={showPrevious}
                      aria-label="View previous image"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-900/40 text-slate-900 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                      onClick={showNext}
                      aria-label="View next image"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
