'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { GalleryDisplayItem } from '../types';

type GalleryGridProps = {
  items: GalleryDisplayItem[];
};

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleOpen(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-soft transition-all duration-300 hover-lift hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <Image
              src={item.galleryUrl}
              alt={item.caption ?? `${item.gCategory} at Flamingo Café`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              priority={index < 2}
            />
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-slate-950/70 via-slate-900/0 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="inline-flex w-fit items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-900">
                {item.gCategory}
              </span>
              {item.caption && (
                <p className="text-sm font-medium text-white drop-shadow-md">
                  {item.caption}
                </p>
              )}
            </div>
            <span className="sr-only">
              Open {item.gCategory} image {item.caption ? `- ${item.caption}` : ''}
            </span>
          </button>
        ))}
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(openValue) => {
          if (!openValue) {
            handleClose();
          }
        }}
      >
        <DialogContent className="w-[92vw] max-w-5xl border-none bg-transparent p-0 shadow-none sm:rounded-3xl">
          {activeItem && (
            <div className="overflow-hidden rounded-3xl bg-white/95 shadow-elegant backdrop-blur">
              <div className="relative aspect-[4/3] w-full bg-slate-200">
                <Image
                  src={activeItem.galleryUrl}
                  alt={activeItem.caption ?? `${activeItem.gCategory} at Flamingo Café`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 60vw, (min-width: 768px) 80vw, 100vw"
                  priority
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 text-slate-900">
                <div>
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

                {items.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                      onClick={showPrevious}
                      aria-label="View previous image"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                      onClick={showNext}
                      aria-label="View next image"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
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
