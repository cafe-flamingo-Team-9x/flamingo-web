"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, MessageSquare, Phone, User, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function ReservationForm() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        date: undefined as Date | undefined,
        time: "18:00",
        comments: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({ name: "", phone: "", date: undefined, time: "18:00", comments: "" });
        }, 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleDateSelect = (date: Date | undefined) => {
        setFormData((prev) => ({ ...prev, date }));
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2 font-heading">
                    Reservation Confirmed!
                </h3>
                <p className="text-muted-foreground max-w-md">
                    We've received your reservation request. We'll contact you shortly to confirm the details.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name and Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name Field */}
                <div className="space-y-2">
                    <label htmlFor="name" className="flex items-center text-sm font-medium text-foreground">
                        <User className="w-4 h-4 mr-2 text-primary" />
                        Full Name
                    </label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="h-11 border-border/50 focus:border-primary/50 transition-colors"
                    />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center text-sm font-medium text-foreground">
                        <Phone className="w-4 h-4 mr-2 text-primary" />
                        Phone Number
                    </label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+94 XX XXX XXXX"
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-11 border-border/50 focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Field */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-foreground">
                        <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                        Date
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full h-11 justify-start text-left font-normal border-border/50 hover:border-primary/50 transition-colors",
                                    !formData.date && "text-muted-foreground",
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={formData.date}
                                onSelect={handleDateSelect}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Time Field */}
                <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center text-sm font-medium text-foreground">
                        <Clock className="w-4 h-4 mr-2 text-primary" />
                        Time
                    </Label>
                    <Input
                        type="time"
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="h-11 border-border/50 focus:border-primary/50 transition-colors bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                </div>
            </div>

            {/* Comments Field */}
            <div className="space-y-2">
                <label htmlFor="comments" className="flex items-center text-sm font-medium text-foreground">
                    <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                    Special Requests
                    <span className="ml-auto text-xs text-muted-foreground">(Optional)</span>
                </label>
                <Textarea
                    id="comments"
                    name="comments"
                    placeholder="Dietary restrictions, seating preferences..."
                    value={formData.comments}
                    onChange={handleChange}
                    rows={3}
                    className="resize-none border-border/50 focus:border-primary/50 transition-colors"
                />
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 transition-colors"
            >
                {isSubmitting ? (
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                    </span>
                ) : (
                    "Reserve Your Table"
                )}
            </Button>

            {/* Info Text */}
            <p className="text-center text-xs text-muted-foreground pt-1">
                We'll confirm your reservation within 2 hours
            </p>
        </form>
    );
}
