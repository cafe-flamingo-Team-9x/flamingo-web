import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Contact | Flamingo Restaurant",
  description: "Get in touch with Flamingo Restaurant",
};

export default function Contact() {
  const contactInfo = [
    {
      icon: <MapPin className="text-primary" size={24} />,
      title: "Location",
      content: "123 Main Street, Piliyandala, Sri Lanka",
      details: "Near the Central Bus Stand",
    },
    {
      icon: <Phone className="text-primary" size={24} />,
      title: "Phone",
      content: "+94 77 123 4567",
      details: "Available during business hours",
    },
    {
      icon: <Mail className="text-primary" size={24} />,
      title: "Email",
      content: "info@flamingo.lk",
      details: "We'll respond within 24 hours",
    },
    {
      icon: <Clock className="text-primary" size={24} />,
      title: "Hours",
      content: "Mon-Fri: 11AM-10PM",
      details: "Sat-Sun: 10AM-11PM",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Contact <span className="text-gradient-accent">Us</span>
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto">
            Get in touch with us for reservations, feedback, or any queries
          </p>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, idx) => (
              <Card key={idx} className="hover-lift hover:shadow-elegant transition-all duration-300">
                <CardHeader className="space-y-2 pb-4">
                  <div className="mx-auto">{info.icon}</div>
                  <CardTitle className="text-center text-foreground">{info.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-lg font-medium text-primary">{info.content}</p>
                  <p className="text-sm text-muted-foreground">{info.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gradient-soft">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-hero text-white rounded-xl p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Easy to Find</h2>
            <p className="max-w-2xl mx-auto mb-6">
              Located in the heart of Piliyandala, we're easily accessible by both public
              and private transport. Look for the pink facade with our signature flamingo!
            </p>
            <div className="text-left space-y-2">
              <p className="flex items-center space-x-2">
                <span className="font-medium">By Bus:</span>
                <span className="text-white/80">Routes 255, 138, 167 - Stop at Piliyandala Central</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="font-medium">By Car:</span>
                <span className="text-white/80">Free parking available on premises</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="font-medium">Landmarks:</span>
                <span className="text-white/80">Next to the Central Bank branch, opposite City Mall</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover-lift hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  Do I need a reservation?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  While walk-ins are welcome, we recommend making a reservation for dinner
                  service and weekends to ensure availability.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  Is there a dress code?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Smart casual attire is recommended. We ask that guests refrain from wearing
                  beachwear or sports attire.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  Do you cater for events?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we offer catering services for private events and special occasions.
                  Please contact us for details.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  Is parking available?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we have a dedicated parking area for our guests with complimentary
                  valet service during peak hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
