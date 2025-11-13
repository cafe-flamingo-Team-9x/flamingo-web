"use client";

import type { LucideIcon } from "lucide-react";
import { Calendar, Menu as MenuIcon, MessageCircle, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StatSection = {
  title: string;
  icon: LucideIcon;
  accent: string;
  description: string;
};

const STAT_SECTIONS: StatSection[] = [
  {
    title: "Reservations Today",
    icon: Calendar,
    accent: "text-primary",
    description: "Connect the reservations API to surface real-time counts and pacing.",
  },
  {
    title: "Seated Guests",
    icon: Users,
    accent: "text-secondary",
    description: "Track front-of-house capacity once the POS integration is configured.",
  },
  {
    title: "New Feedback",
    icon: MessageCircle,
    accent: "text-accent",
    description: "Plug in customer feedback sources to monitor insights here.",
  },
];

export default function DashboardPage() {
  return (
    <Suspense fallback={<section className="min-h-[50vh]" aria-busy="true" aria-live="polite" />}>
      <DashboardPageContent />
    </Suspense>
  );
}

function DashboardPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const loginStatus = searchParams.get("login");
    if (!loginStatus) return;

    if (loginStatus === "success") {
      toast.success("Signed in successfully. Welcome back!");
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("login");

    const nextPath = `${pathname}${nextParams.size ? `?${nextParams.toString()}` : ""}`;
    router.replace(nextPath, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-primary">Welcome back, Admin!</h1>
        <p className="text-sm text-muted-foreground">
          Monitor performance, manage reservations, and keep the Flamingo experience unforgettable.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {STAT_SECTIONS.map((stat) => (
          <Card key={stat.title} className="border-border/60 bg-background/90">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.accent}`} aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-background/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
              Upcoming reservations
            </CardTitle>
            <CardDescription>
              Preview who&apos;s arriving tonight so the team can prepare.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed border-border/60 bg-background/80 p-6 text-sm text-muted-foreground">
              Connect your booking engine to display the next arrivals and capacity at a glance.
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageCircle className="h-5 w-5 text-secondary" aria-hidden="true" />
              Guest feedback
            </CardTitle>
            <CardDescription>Respond promptly to keep satisfaction scores high.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed border-border/60 bg-background/80 p-6 text-sm text-muted-foreground">
              Link feedback channels to spotlight recent guest sentiments and action items.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-background/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MenuIcon className="h-5 w-5 text-primary" aria-hidden="true" />
            Menu highlights
          </CardTitle>
          <CardDescription>
            Showcase specials and track popularity for next week&apos;s service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border/60 bg-background/80 p-6 text-sm text-muted-foreground">
            Hook up menu analytics to highlight top-performing dishes and specials automatically.
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
