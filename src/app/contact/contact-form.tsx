'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  className?: string;
}

export function ContactForm({ className }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    // Client-side validation
    if (
      !trimmedData.name ||
      !trimmedData.email ||
      !trimmedData.subject ||
      !trimmedData.message
    ) {
      toast.error('Please complete all fields before sending your message.');
      return;
    }

    if (trimmedData.name.length < 2) {
      toast.error('Name must be at least 2 characters.');
      return;
    }

    if (trimmedData.subject.length < 3) {
      toast.error('Subject must be at least 3 characters.');
      return;
    }

    if (trimmedData.message.length < 10) {
      toast.error('Message must be at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trimmedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle validation errors from server
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const firstError = errorData.errors[0];
          throw new Error(firstError.message || 'Validation failed');
        }
        throw new Error(errorData.error || 'Failed to send message');
      }

      toast.success('Message sent successfully!', {
        description: 'Our team will get back to you within 24 hours.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again later.';
      toast.error(errorMessage);
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn('border border-border/50 shadow-md', className)}>
      <CardHeader>
        <CardTitle className="text-2xl text-foreground font-heading">
          Send Us a Message
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
                placeholder="Your name"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData({ ...formData, email: event.target.value })
                }
                placeholder="name@example.com"
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(event) =>
                setFormData({ ...formData, subject: event.target.value })
              }
              placeholder="How can we help?"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              rows={6}
              value={formData.message}
              onChange={(event) =>
                setFormData({ ...formData, message: event.target.value })
              }
              placeholder="Share your inquiry, special request, or feedback..."
              className="resize-none"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary text-white shadow-pink-glow hover:bg-primary/90 h-12"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
