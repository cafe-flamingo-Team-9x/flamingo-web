"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionHeaderProps {
    title: string;
    highlightWord?: string;
    description: string;
}

export function AnimatedSectionHeader({
    title,
    highlightWord,
    description,
}: AnimatedSectionHeaderProps) {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);
    const decorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!titleRef.current || !descRef.current) return;

        const ctx = gsap.context(() => {
            // Title animation
            gsap.from(titleRef.current, {
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                },
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
            });

            // Description animation
            gsap.from(descRef.current, {
                scrollTrigger: {
                    trigger: descRef.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
                y: 15,
                opacity: 0,
                duration: 0.6,
                delay: 0.2,
                ease: "power2.out",
            });

            // Decorative line animation
            if (decorRef.current) {
                gsap.from(decorRef.current, {
                    scrollTrigger: {
                        trigger: decorRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                    scaleX: 0.9,
                    duration: 0.6,
                    delay: 0.4,
                    ease: "power2.out",
                });
            }
        });

        return () => ctx.revert();
    }, []);

    const renderTitle = () => {
        if (!highlightWord) return title;

        const parts = title.split(highlightWord);
        return (
            <>
                {parts[0]}
                <span className="text-gradient-accent">{highlightWord}</span>
                {parts[1]}
            </>
        );
    };

    return (
        <div className="text-center mb-20">
            <h2
                ref={titleRef}
                className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-heading"
            >
                {renderTitle()}
            </h2>
            <div
                ref={decorRef}
                className="w-24 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 mx-auto mb-6 rounded-full"
            />
            <p
                ref={descRef}
                className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed"
            >
                {description}
            </p>
        </div>
    );
}
