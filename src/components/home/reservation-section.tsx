"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, Phone } from "lucide-react";
import { ReservationForm } from "./reservation-form";

gsap.registerPlugin(ScrollTrigger);

export function ReservationSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const decorRef = useRef<HTMLDivElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);
    const formContainerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Title animation - subtle fade and slide
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

            // Decorative line
            gsap.from(decorRef.current, {
                scrollTrigger: {
                    trigger: decorRef.current,
                    start: "top 85%",
                    toggleActions: "play none none none",
                },
                scaleX: 0,
                duration: 0.5,
                delay: 0.15,
                ease: "power2.out",
            });

            // Description
            gsap.from(descRef.current, {
                scrollTrigger: {
                    trigger: descRef.current,
                    start: "top 85%",
                    toggleActions: "play none none none",
                },
                y: 15,
                opacity: 0,
                duration: 0.5,
                delay: 0.25,
                ease: "power2.out",
            });

            // Form container - subtle slide from left
            gsap.from(formContainerRef.current, {
                scrollTrigger: {
                    trigger: formContainerRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none",
                },
                x: -30,
                opacity: 0,
                duration: 0.6,
                delay: 0.3,
                ease: "power2.out",
            });

            // Sidebar - subtle slide from right with stagger
            if (sidebarRef.current) {
                gsap.from(sidebarRef.current, {
                    scrollTrigger: {
                        trigger: sidebarRef.current,
                        start: "top 80%",
                        toggleActions: "play none none none",
                    },
                    x: 30,
                    opacity: 0,
                    duration: 0.6,
                    delay: 0.4,
                    ease: "power2.out",
                });

                // Animate sidebar children with subtle stagger
                gsap.from(sidebarRef.current.children, {
                    scrollTrigger: {
                        trigger: sidebarRef.current,
                        start: "top 80%",
                        toggleActions: "play none none none",
                    },
                    y: 10,
                    opacity: 0,
                    duration: 0.4,
                    stagger: 0.1,
                    delay: 0.6,
                    ease: "power2.out",
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="reservations"
            className="scroll-mt-24 md:scroll-mt-28 py-16 bg-gradient-to-b from-background to-muted/20 relative"
        >
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-heading">
                            Reserve Your <span className="text-gradient-accent">Table</span>
                        </h2>
                        <div
                            ref={decorRef}
                            className="w-16 h-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mx-auto mb-4"
                        />
                        <p ref={descRef} className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                            Book your dining experience at Flamingo
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Form */}
                        <div ref={formContainerRef} className="lg:col-span-2">
                            <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 shadow-sm">
                                <ReservationForm />
                            </div>
                        </div>

                        {/* Info Sidebar */}
                        <div ref={sidebarRef} className="space-y-4">
                            <div className="bg-gradient-to-br from-primary/5 to-orange-500/5 border border-primary/10 rounded-xl p-5">
                                <h3 className="text-lg font-bold text-foreground mb-3 font-heading">
                                    What to Expect
                                </h3>
                                <ul className="space-y-2.5 text-sm text-muted-foreground">
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2.5 flex-shrink-0" />
                                        <span>Confirmation within 2 hours</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2.5 flex-shrink-0" />
                                        <span>Arrive 10 min early</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2.5 flex-shrink-0" />
                                        <span>BYOB welcome</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2.5 flex-shrink-0" />
                                        <span>Groups 8+: call directly</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-card border border-border/50 rounded-xl p-5">
                                <h3 className="text-lg font-bold text-foreground mb-3 font-heading">
                                    Need Help?
                                </h3>
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                                        <span className="text-foreground font-medium">+94 XX XXX XXXX</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                                        <span className="text-muted-foreground">Mon-Sun: 11AM - 10PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
