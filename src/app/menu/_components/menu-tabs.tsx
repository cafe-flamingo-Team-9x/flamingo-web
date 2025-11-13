"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { MenuCategoryGroup, VisibleMenuItem } from "../types";

type MenuTabsProps = {
  categories: string[];
  groups: MenuCategoryGroup[];
};

const GRID_IMAGE_SIZES =
  "(min-width: 1280px) 30vw, (min-width: 1024px) 33vw, (min-width: 768px) 45vw, 100vw";

const BLUR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='50' x2='50' y2='0'%3E%3Cstop stop-color='%23fdf2f8'/%3E%3Cstop offset='1' stop-color='%23fee2e2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='50' height='50' rx='12' fill='url(%23g)'/%3E%3C/svg%3E";

const priceFormatter = new Intl.NumberFormat("en-LK", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatPrice(value: number) {
  return priceFormatter.format(value);
}

function formatCategoryLabel(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function MenuTabs({ categories, groups }: MenuTabsProps) {
  const [activeTab, setActiveTab] = useState(categories[0] ?? "");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    const container = cardsRef.current;

    if (!container || prefersReducedMotion) {
      return;
    }

    container.setAttribute("data-active-tab", activeTab);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-menu-card]",
        { opacity: 0, y: 32, scale: 0.96, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.65,
          ease: "power2.out",
          stagger: 0.08,
        },
      );
    }, cardsRef);

    return () => {
      ctx.revert();
    };
  }, [activeTab, prefersReducedMotion]);

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
      <TabsList className="mx-auto mb-12 grid w-full max-w-2xl grid-cols-2 gap-2 rounded-full bg-white/10 p-1 backdrop-blur md:grid-cols-4">
        {categories.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            className="rounded-full text-sm capitalize transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 md:text-base"
          >
            {category}
          </TabsTrigger>
        ))}
      </TabsList>

      {groups.map(({ category, items }) => (
        <TabsContent key={category} value={category} className="focus-visible:outline-none">
          <div
            ref={activeTab === category ? cardsRef : undefined}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

type MenuCardProps = {
  item: VisibleMenuItem;
};

function MenuCard({ item }: MenuCardProps) {
  const hasImage = Boolean(item.imageUrl);
  const categoryLabel = formatCategoryLabel(item.category);
  const placeholderText = getPlaceholderCopy(item);

  return (
    <Card
      data-menu-card
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant"
    >
      <div
        className={cn(
          "relative h-48 overflow-hidden bg-slate-100",
          !hasImage && "flex items-center justify-center bg-gradient-soft",
        )}
      >
        {hasImage ? (
          <Image
            src={item.imageUrl as string}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={GRID_IMAGE_SIZES}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            loading="lazy"
          />
        ) : (
          <span className="px-6 text-center text-base font-semibold text-primary">
            {placeholderText}
          </span>
        )}
        <Badge className="pointer-events-none absolute right-4 top-4 bg-white/90 text-[0.65rem] uppercase tracking-[0.25em] text-slate-900 shadow-sm">
          {categoryLabel}
        </Badge>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
            {item.description ? (
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            ) : null}
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            LKR {formatPrice(item.price)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function getPlaceholderCopy(item: VisibleMenuItem) {
  const category = item.category.toLowerCase();

  if (category.includes("beverage")) {
    return "Signature Beverage";
  }

  if (category.includes("dessert")) {
    return "Sweet Creation";
  }

  if (category.includes("starter")) {
    return "Seasonal Starter";
  }

  if (category.includes("main")) {
    return "Chef-crafted Main";
  }

  return "Kitchen Favorite";
}
