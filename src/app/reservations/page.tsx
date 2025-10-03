"use client";

import { useState } from "react";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Reservations() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: "",
    time: "",
    occasion: "",
    notes: "",
  });

  const timeSlots = [
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
  ];

  const occasions = [
    "Regular Dining",
    "Birthday",
    "Anniversary",
    "Business Meal",
    "Special Occasion",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !date ||
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.time ||
      !formData.guests
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success(
      "Reservation request submitted! We'll confirm via email shortly.",
      {
        description: "Check your email for confirmation details.",
      }
    );

    setFormData({
      name: "",
      email: "",
      phone: "",
      guests: "",
      time: "",
      occasion: "",
      notes: "",
    });
    setDate(new Date());
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Make a <span className="text-gradient-accent">Reservation</span>
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto">
            Book your table for a memorable dining experience
          </p>
        </div>
      </section>

      {/* Reservation Form Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8 max-w-6xl mx-auto">
            {/* Form */}
            <Card className="hover-lift hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">
                  Book Your Table
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="guests">Number of Guests *</Label>
                      <Input
                        id="guests"
                        name="guests"
                        type="number"
                        min="1"
                        max="20"
                        value={formData.guests}
                        onChange={(e) =>
                          setFormData({ ...formData, guests: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <Select
                        value={formData.time}
                        onValueChange={(value) =>
                          setFormData({ ...formData, time: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="occasion">Occasion</Label>
                      <Select
                        value={formData.occasion}
                        onValueChange={(value) =>
                          setFormData({ ...formData, occasion: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          {occasions.map((occasion) => (
                            <SelectItem key={occasion} value={occasion}>
                              {occasion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Special Requests</Label>
                    <Input
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Any dietary restrictions or special requests?"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white shadow-pink-glow"
                    size="lg"
                  >
                    Submit Reservation
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Calendar */}
            <div>
              <Card className="hover-lift hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </CardContent>
              </Card>

              {/* Opening Hours */}
              <Card className="mt-6 hover-lift hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">
                    Opening Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium text-foreground">
                        Monday - Friday:
                      </span>{" "}
                      11:00 AM - 10:00 PM
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Saturday - Sunday:
                      </span>{" "}
                      10:00 AM - 11:00 PM
                    </p>
                    <p className="text-sm mt-4">
                      * Last reservation taken 1 hour before closing
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
