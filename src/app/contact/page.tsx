import { Clock, Mail, MapPin, Phone } from "lucide-react";

import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Contact | Flamingo Restaurant",
  description: "Reach out to Flamingo Café for reservations, events, or general inquiries",
};

export default function Contact() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-grow">

      <section className="bg-gradient-dark pt-32 pb-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl font-heading">
            Get in <span className="text-gradient-accent">Touch</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-white/80 leading-relaxed">
            Have a question or special request? We&apos;d love to hear from you
          </p>
        </div>
      </section>

      <section className="bg-background pb-20 pt-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            {/* Dual Column Layout */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left Column - Contact Information */}
              <div className="flex flex-col">
                <Card className="border border-border/50 shadow-md flex-1">
                  <CardHeader>
                    <CardTitle className="text-2xl text-foreground font-heading">
                      Get in Touch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
                        <MapPin className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1 font-heading">Location</p>
                        <p className="text-muted-foreground text-sm">Piliyandala, Sri Lanka</p>
                        <p className="text-sm text-muted-foreground">
                          Opposite City Mall, next to Central Bank branch
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
                        <Phone className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1 font-heading">Phone</p>
                        <p className="text-muted-foreground text-sm">+94 77 123 4567</p>
                        <p className="text-xs text-muted-foreground">
                          Ask for Sameera, our reservations lead
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
                        <Mail className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1 font-heading">Email</p>
                        <p className="text-muted-foreground text-sm">hello@flamingo.lk</p>
                        <p className="text-sm text-muted-foreground">reservations@flamingo.lk</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
                        <Clock className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1 font-heading">
                          Opening Hours
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Monday - Friday: 11:00 AM – 10:00 PM
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Saturday - Sunday: 10:00 AM – 11:00 PM
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Contact Form */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <ContactForm />
              </div>
            </div>

            {/* Map Section - Full Width Below */}
            <Card className="overflow-hidden border border-border/50 shadow-md mt-8">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground font-heading">
                  Find Us on the Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  title="Flamingo Café location map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.559494627982!2d79.92235967614253!3d6.8016116198746245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae24fb5dc423c7f%3A0x7d1d06dc4c89476d!2sPiliyandala!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
                  className="h-[400px] w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      </main>

      <Footer />
    </div>
  );
}
