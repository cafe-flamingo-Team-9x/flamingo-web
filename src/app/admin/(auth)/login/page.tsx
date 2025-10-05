'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

const errorMessages: Record<string, string> = {
  google:
    'We ran into a problem starting the Google sign-in flow. Please try again.',
  GoogleSignin: 'Unable to connect to Google. Please try again.',
  OAuthSignin: 'Unable to connect to Google. Please try again.',
  OAuthCallback:
    'Google rejected the sign-in request. Ensure the OAuth redirect URI matches.',
  OAuthCreateAccount:
    'We could not create your Google account. Contact support.',
  OAuthAccountNotLinked:
    'This Google account is already linked to a different login method. Sign in with that method.',
  EmailSignin: 'Email sign-in is disabled for this account.',
  CredentialsSignin: 'Invalid credentials. Please try again.',
  AccessDenied: 'You do not have access to this application.',
  not_admin:
    'This Google account is not authorized for the Cafe Flamingo admin dashboard.',
  Verification: 'The sign-in link is no longer valid. Request a new one.',
};

function getErrorMessage(error?: string | null) {
  if (!error) return undefined;
  return (
    errorMessages[error] ??
    'Something went wrong while signing you in with Google.'
  );
}

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams?.get('error');
  const callbackUrlParam = searchParams?.get('callbackUrl');
  const errorDescription = searchParams?.get('error_description') ?? undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errorMessage = useMemo(() => getErrorMessage(errorParam), [errorParam]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, {
        description: errorDescription,
      });
    }
  }, [errorMessage, errorDescription]);

  const buildCallbackUrl = useCallback(() => {
    const fallback = '/admin/dashboard';

    if (typeof window === 'undefined') {
      return callbackUrlParam ?? fallback;
    }

    try {
      const url = new URL(callbackUrlParam ?? fallback, window.location.origin);
      url.searchParams.set('login', 'success');
      return url.toString();
    } catch (error) {
      console.warn('Failed to parse callback URL, using fallback.', error);
      return fallback;
    }
  }, [callbackUrlParam]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true);
    toast.info('Redirecting to Google…');

    try {
      const finalCallbackUrl = buildCallbackUrl();
      await signIn('google', { callbackUrl: finalCallbackUrl });
    } catch (error) {
      console.error('Failed to initiate Google sign-in:', error);
      toast.error('Unable to start Google sign-in. Please try again.');
      setIsSubmitting(false);
    }
  }, [buildCallbackUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4 py-16">
      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Image
              src="/assets/flamingo-logo.jpg"
              alt="Cafe Flamingo logo"
              width={64}
              height={64}
              className="rounded-full object-cover"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-2xl">Admin sign in</CardTitle>
            <CardDescription className="text-balance">
              Access the Cafe Flamingo admin dashboard using your approved
              Google account.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage && (
            <Alert
              variant="destructive"
              aria-live="assertive"
              className="border-destructive/60 bg-destructive/10 text-destructive"
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>Access denied</AlertTitle>
              <AlertDescription className="text-sm text-destructive">
                {errorMessage}
                {errorDescription ? (
                  <span className="mt-1 block text-xs text-destructive/90">
                    {errorDescription}
                  </span>
                ) : null}
              </AlertDescription>
            </Alert>
          )}
          <Button
            type="button"
            className={cn('w-full gap-2')}
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="size-5"
              aria-hidden
            >
              <path
                fill="#4285F4"
                d="M44.5 20H24v8.5h11.8C34.5 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.4 1.2 8.7 3.3l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.1-2.7-.5-4z"
              />
              <path
                fill="#34A853"
                d="m6.3 14.7 6.6 4.8C14.4 16 18.8 13 24 13c3.3 0 6.4 1.2 8.7 3.3l6.4-6.4C34.6 4.1 29.6 2 24 2 15.4 2 7.9 6.5 3.6 13.2l2.7 1.5z"
              />
              <path
                fill="#FBBC05"
                d="M24 46c5.5 0 10.5-1.8 14.4-4.9l-6.6-5c-2 1.3-4.6 2.1-7.8 2.1-5.7 0-10.4-3.8-12.1-9l-6.5 5c3.2 6.3 9.8 10.8 17.6 10.8z"
              />
              <path
                fill="#EA4335"
                d="M44.5 20H24v8.5h11.8A11.9 11.9 0 0 1 24 37c-5.7 0-10.4-3.8-12.1-9l-6.5 5C8.8 39.3 15.4 44 24 44c11 0 20-8 20-22 0-1.3-.1-2.7-.5-4z"
              />
            </svg>
            {isSubmitting ? 'Redirecting…' : 'Continue with Google'}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
          <p>
            Having trouble signing in?{' '}
            <a
              href="mailto:support@cafeflamingo.com"
              className="text-primary underline underline-offset-4"
            >
              Contact support
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
