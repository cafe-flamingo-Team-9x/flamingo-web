"use client";

import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const errorMessages: Record<string, string> = {
  google: "We ran into a problem starting the Google sign-in flow. Please try again.",
  GoogleSignin: "Unable to connect to Google. Please try again.",
  OAuthSignin: "Unable to connect to Google. Please try again.",
  OAuthCallback: "Google rejected the sign-in request. Ensure the OAuth redirect URI matches.",
  OAuthCreateAccount: "We could not create your Google account. Contact support.",
  OAuthAccountNotLinked:
    "This Google account is already linked to a different login method. Sign in with that method.",
  EmailSignin: "Email sign-in is disabled for this account.",
  CredentialsSignin: "Invalid credentials. Please try again.",
  AccessDenied: "You do not have access to this application.",
  not_admin: "This Google account is not authorized for the Cafe Flamingo admin dashboard.",
  Verification: "The sign-in link is no longer valid. Request a new one.",
};

function getErrorMessage(error?: string | null) {
  if (!error) return undefined;
  return errorMessages[error] ?? "Something went wrong while signing you in with Google.";
}

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams?.get("error");
  const callbackUrlParam = searchParams?.get("callbackUrl");
  const errorDescription = searchParams?.get("error_description") ?? undefined;
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
    const fallback = "/admin/dashboard";

    if (typeof window === "undefined") {
      return callbackUrlParam ?? fallback;
    }

    try {
      const url = new URL(callbackUrlParam ?? fallback, window.location.origin);
      url.searchParams.set("login", "success");
      return url.toString();
    } catch (error) {
      console.warn("Failed to parse callback URL, using fallback.", error);
      return fallback;
    }
  }, [callbackUrlParam]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true);
    toast.info("Redirecting to Google…");

    try {
      const finalCallbackUrl = buildCallbackUrl();
      await signIn("google", { callbackUrl: finalCallbackUrl });
    } catch (error) {
      console.error("Failed to initiate Google sign-in:", error);
      toast.error("Unable to start Google sign-in. Please try again.");
      setIsSubmitting(false);
    }
  }, [buildCallbackUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4 py-16">
      <Card className="w-full max-w-md border-border/60 shadow-xl py-2">
        <CardHeader className="space-y-4 text-center py-3">
          <div className="mx-auto flex size-[72px] items-center justify-center rounded-full bg-primary/10">
            <Image
              src="/assets/flamingo-logo.jpg"
              alt="Cafe Flamingo logo"
              width={72}
              height={72}
              className="rounded-full object-cover"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-2xl">Admin Sign-In</CardTitle>
            <CardDescription className="text-balance">
              Access the Cafe Flamingo admin dashboard using your approved Google account.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-7 py-3">
          {errorMessage && (
            <Alert
              variant="destructive"
              aria-live="assertive"
              className="border-destructive/50 bg-destructive/10"
            >
              <AlertTriangle className="size-4" aria-hidden="true" />
              <AlertTitle>Sign-in error</AlertTitle>
              <AlertDescription className="text-sm">
                {errorMessage}
                {errorDescription ? (
                  <span className="mt-1 block text-xs text-destructive/90">{errorDescription}</span>
                ) : null}
              </AlertDescription>
            </Alert>
          )}
          <Button
            type="button"
            className={cn("w-full gap-2")}
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="size-5"
              aria-hidden="true"
            >
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            {isSubmitting ? "Redirecting…" : "Continue with Google"}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground py-3">
          <p>
            Having trouble signing in?{" "}
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
