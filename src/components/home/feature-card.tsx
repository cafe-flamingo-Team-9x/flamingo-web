"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card, CardContent } from "@/components/ui/card";

gsap.registerPlugin(ScrollTrigger);

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    index: number;
}

export function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cardRef.current) return;

        const ctx = gsap.context(() => {
            // Initial animation on scroll
            gsap.from(cardRef.current, {
                scrollTrigger: {
                    trigger: cardRef.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
                y: 30,
                opacity: 0,
                duration: 0.6,
                delay: index * 0.15,
                ease: "power2.out",
            });

            // Icon animations
            gsap.from(iconRef.current, {
                scrollTrigger: {
                    trigger: cardRef.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
                scale: 0.6,
                rotation: -90,
                duration: 0.5,
                delay: index * 0.15 + 0.25,
                ease: "back.out(1.2)",
            });

            // Content stagger animation
            gsap.from(contentRef.current?.children || [], {
                scrollTrigger: {
                    trigger: cardRef.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
                y: 12,
                opacity: 0,
                duration: 0.45,
                stagger: 0.08,
                delay: index * 0.15 + 0.35,
                ease: "power1.out",
            });
        }, cardRef);

        return () => ctx.revert();
    }, [index]);

    const handleMouseEnter = () => {
        if (!cardRef.current || !iconRef.current || !glowRef.current) return;

        gsap.to(cardRef.current, {
            y: -4,
            scale: 1.005,
            duration: 0.3,
            ease: "power2.out",
        });

        gsap.to(iconRef.current, {
            scale: 1.03,
            rotation: 1,
            duration: 0.3,
            ease: "power2.out",
        });

        gsap.to(glowRef.current, {
            opacity: 0.35,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
        });
    };

    const handleMouseLeave = () => {
        if (!cardRef.current || !iconRef.current || !glowRef.current) return;

        gsap.to(cardRef.current, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
        });

        gsap.to(iconRef.current, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: "power2.out",
        });

        gsap.to(glowRef.current, {
            opacity: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
        });
    };

    return (
        <div className="relative">
            {/* Glow effect */}
            <div
                ref={glowRef}
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-orange-500/10 blur-lg opacity-0 transition-opacity"
                style={{ zIndex: -1 }}
            />

            <Card
                ref={cardRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative h-full overflow-hidden border border-border/50 bg-gradient-to-br from-card via-card to-card/95 shadow-md transition-shadow duration-300 hover:shadow-lg hover:border-primary/20"
            >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />

                <CardContent className="relative p-10 text-center flex flex-col justify-between min-h-[280px]">
                    {/* Icon container */}
                    <div ref={iconRef} className="relative inline-block mb-6">
                        <div className="relative flex justify-center items-center w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/8 via-primary/3 to-transparent border border-primary/15">
                            <div className="scale-110">{icon}</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div ref={contentRef} className="space-y-3">
                        <h3 className="text-2xl font-bold text-foreground font-heading tracking-tight">
                            {title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                            {description}
                        </p>
                    </div>

                    {/* Decorative bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                </CardContent>
            </Card>
        </div>
    );
}
