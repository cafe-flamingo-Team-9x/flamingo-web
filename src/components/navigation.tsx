"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

const normalizeHrefPathname = (href: string) => {
  const path = href.split("#")[0];
  return path === "" ? "/" : path;
};

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-gradient-dark backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" aria-label="Flamingo home" className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src="/assets/flamingo-logo.png"
              alt="Flamingo Café logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg text-pink-200">
            Flamingo Café
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => {
            const linkPathname = normalizeHrefPathname(link.href);
            const isActive =
              pathname === linkPathname || (linkPathname !== "/" && pathname.startsWith(linkPathname));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex flex-col items-center text-sm font-medium transition-colors",
                  "text-white/80 hover:text-white",
                  isActive && "text-white",
                )}
              >
                <span className="pb-1">{link.label}</span>
                <span
                  className={cn(
                    "h-0.5 w-full origin-center scale-x-0 bg-accent transition-transform duration-300",
                    isActive ? "scale-x-100" : "group-hover:scale-x-100",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex">
          <Button asChild size="lg" className="px-6 text-base">
            <Link href="/#reservations">Book a Table</Link>
          </Button>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-white md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
          <span className="sr-only">Toggle navigation</span>
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={cn(
          "md:hidden",
          isOpen ? "max-h-screen" : "max-h-0",
          "overflow-hidden border-t border-white/10 bg-gradient-dark transition-[max-height] duration-300 ease-in-out",
        )}
      >
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6">
          {NAV_LINKS.map((link) => {
            const linkPathname = normalizeHrefPathname(link.href);
            const isActive =
              pathname === linkPathname || (linkPathname !== "/" && pathname.startsWith(linkPathname));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-base font-medium text-white/80",
                  "hover:text-white",
                  isActive && "text-white",
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <Button asChild size="lg" className="w-full justify-center text-base">
            <Link href="/#reservations" onClick={() => setIsOpen(false)}>
              Book a Table
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
