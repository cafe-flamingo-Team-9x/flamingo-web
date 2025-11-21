"use client";

import { Clock, Utensils, Wine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/home/feature-card";
import { AnimatedSectionHeader } from "@/components/home/animated-section-header";
import { AboutSection } from "@/components/home/about-section";
import { ReservationSection } from "@/components/home/reservation-section";

export default function Home() {
  const features = [
    {
      icon: <Utensils className="w-10 h-10 text-primary" />,
      title: "Exceptional Cuisine",
      description: "Carefully crafted dishes using the finest ingredients",
    },
    {
      icon: <Wine className="w-10 h-10 text-primary" />,
      title: "BYOB Policy",
      description: "Bring your favorite beverages to complement your meal",
    },
    {
      icon: <Clock className="w-10 h-10 text-primary" />,
      title: "Flexible Hours",
      description: "Open 7 days a week for lunch and dinner",
    },
  ];

  const container = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 },
      });
      tl.from(".hero-bg-overlay", { opacity: 0, duration: 1.5 })
        .from(
          ".hero-h1",
          { opacity: 0, y: 20, stagger: 0.1 },
          "-=0.5",
        )
        .from(".hero-p1", { opacity: 0, y: 20 }, "-=0.7")
        .from(".hero-p2", { opacity: 0, y: 20 }, "-=0.7")
        .from(".hero-buttons", { opacity: 0, y: 20 }, "-=0.7");
    },
    { scope: container },
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-grow">

        {/* Hero Section */}
        <section
          ref={container}
          className="relative flex min-h-screen items-center justify-center overflow-hidden pt-24 pb-14 md:pt-32 md:pb-20"
        >
          <div className="absolute inset-0">
            <Image
              src="/assets/hero-dining.jpg"
              alt="Flamingo Restaurant Dining"
              fill
              className="object-cover"
              priority
            />
            <div className="hero-bg-overlay absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/75 to-slate-800/70" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <h1 className="hero-h1 text-6xl md:text-6xl lg:text-8xl font-bold mb-6 font-heading text-white">
              Welcome to <span className="text-gradient-accent">Flamingo</span>
            </h1>
            <p className="hero-p1 text-2xl md:text-3xl text-pink-200 mb-4 font-heading tracking-wide">
              Cafe • Bakery • Lounge
            </p>
            <p className="hero-p2 text-base md:text-lg text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience exceptional dining in the heart of Piliyandala
            </p>
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-pink-glow text-base h-12 px-8"
              >
                <Link href="/menu">View Our Menu</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-slate-900 text-base h-12 px-8"
              >
                <Link href="/#reservations">Reserve a Table</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-background via-background to-muted/10 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-500/5 rounded-full blur-2xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSectionHeader
              title="Why Choose Flamingo?"
              highlightWord="Flamingo"
              description="We combine casual elegance with exceptional cuisine for an unforgettable dining experience"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Separator */}
        <div className="relative h-3 bg-gradient-to-b from-background to-muted/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>


        {/* About Section */}
        <AboutSection />

        {/* Separator */}
        <div className="relative h-3 bg-gradient-to-b from-background to-muted/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>

        {/* Reservation Section */}
        <ReservationSection />

      </main>

      <Footer />
    </div>
  );
}
