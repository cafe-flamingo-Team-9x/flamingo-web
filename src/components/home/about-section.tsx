"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, MapPin } from "lucide-react";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const decorRef = useRef<HTMLDivElement>(null);
    const paragraph1Ref = useRef<HTMLParagraphElement>(null);
    const paragraph2Ref = useRef<HTMLParagraphElement>(null);
    const infoCardsRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Image carousel state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [
        "/assets/restaurant-interior.jpg",
        "/assets/hero-dining.jpg",
        "/assets/food-main.jpg",
    ];
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Title animation - subtle fade and slide up
            gsap.from(titleRef.current, {
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none",
                },
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
            });

            // Decorative line - subtle scale from center
            gsap.from(decorRef.current, {
                scrollTrigger: {
                    trigger: decorRef.current,
                    start: "top 85%",
                    toggleActions: "play none none none",
                },
                scaleX: 0,
                duration: 0.5,
                delay: 0.2,
                ease: "power2.out",
            });

            // Paragraphs - subtle stagger
            gsap.from([paragraph1Ref.current, paragraph2Ref.current], {
                scrollTrigger: {
                    trigger: paragraph1Ref.current,
                    start: "top 85%",
                    toggleActions: "play none none none",
                },
                y: 15,
                opacity: 0,
                duration: 0.5,
                stagger: 0.15,
                delay: 0.3,
                ease: "power2.out",
            });

            // Info cards - subtle stagger from left
            if (infoCardsRef.current) {
                gsap.from(infoCardsRef.current.children, {
                    scrollTrigger: {
                        trigger: infoCardsRef.current,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                    x: -20,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    delay: 0.5,
                    ease: "power2.out",
                });
            }

            // Image - very subtle scale and fade
            gsap.from(imageContainerRef.current, {
                scrollTrigger: {
                    trigger: imageContainerRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none",
                },
                scale: 0.98,
                opacity: 0,
                duration: 0.7,
                ease: "power2.out",
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Image carousel effect
    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (currentImageIndex + 1) % images.length;

            // Animate out current image with blur
            if (imageRefs.current[currentImageIndex]) {
                gsap.to(imageRefs.current[currentImageIndex], {
                    opacity: 0,
                    filter: "blur(8px)",
                    duration: 0.6,
                    ease: "power2.inOut",
                });
            }

            // Animate in next image with blur clearing
            if (imageRefs.current[nextIndex]) {
                gsap.fromTo(
                    imageRefs.current[nextIndex],
                    {
                        opacity: 0,
                        filter: "blur(8px)",
                    },
                    {
                        opacity: 1,
                        filter: "blur(0px)",
                        duration: 0.6,
                        ease: "power2.inOut",
                    }
                );
            }

            setCurrentImageIndex(nextIndex);
        }, 3000);

        return () => clearInterval(interval);
    }, [currentImageIndex]);

    return (
        <section ref={sectionRef} className="py-20 relative dark:bg-slate-900/40">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                    <div className="order-2 lg:order-1 space-y-5">
                        <div>
                        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-heading">
                                About <span className="text-gradient-accent">Flamingo</span>
                            </h2>
                            <div
                                ref={decorRef}
                                className="w-20 h-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mb-6"
                            />
                        </div>

                        <p ref={paragraph1Ref} className="text-muted-foreground text-base md:text-lg mb-5 leading-relaxed">
                            Located in the heart of Piliyandala, Flamingo offers a unique dining experience that
                            combines casual elegance with exceptional cuisine. Our BYOB policy allows you to
                            bring your favorite beverages, making every meal personal and special.
                        </p>
                        <p ref={paragraph2Ref} className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
                            Whether you're here for a casual lunch, a romantic dinner, or a celebration with
                            friends and family, our warm atmosphere and attentive service ensure a memorable
                            experience.
                        </p>

                        <div ref={infoCardsRef} className="space-y-4 pt-3">
                            <div className="flex items-start space-x-4 p-4 rounded-lg bg-card/50 border border-border/30 hover:border-primary/30 transition-colors">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <MapPin className="text-primary" size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground font-heading mb-1">Location</p>
                                    <p className="text-muted-foreground">Piliyandala, Sri Lanka</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4 p-4 rounded-lg bg-card/50 border border-border/30 hover:border-primary/30 transition-colors">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Clock className="text-primary" size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground font-heading mb-1">Hours</p>
                                    <p className="text-muted-foreground">Mon-Fri: 11AM-10PM | Sat-Sun: 10AM-11PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div ref={imageContainerRef} className="relative rounded-2xl overflow-hidden shadow-lg group h-[500px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />
                            {images.map((src, index) => (
                                <div
                                    key={src}
                                    ref={(el) => {
                                        imageRefs.current[index] = el;
                                    }}
                                    className="absolute inset-0 w-full h-full"
                                    style={{
                                        opacity: index === 0 ? 1 : 0,
                                        filter: index === 0 ? 'blur(0px)' : 'blur(8px)',
                                        zIndex: index === currentImageIndex ? 10 : 0,
                                    }}
                                >
                                    <Image
                                        src={src}
                                        alt={`Flamingo Restaurant ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 600px"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
