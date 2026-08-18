import type { User } from "firebase/auth";
import { useVerifyEmailGateStore } from "@/store/useVerifyEmailGateStore";

/** email verification required flag */
export function isEmailVerificationRequired(): boolean {
  return process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION !== "false";
}

export function hasGoogleProvider(user: User): boolean {
  return user.providerData.some((p) => p.providerId === "google.com");
}

/** user email trusted flag */
export function isUserEmailTrusted(user: User | null | undefined): boolean {
  if (!isEmailVerificationRequired()) return true;
  if (!user) return false;
  if (user.emailVerified) return true;
  if (hasGoogleProvider(user)) return true;
  return false;
}

export function getEmailVerificationContinueUrl(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_SITE_URL || "https://maplezhuan.ca";
  }
  return window.location.origin;
}

/** soft-gate helper. returns true if the user may proceed. if not trusted, opens the verify-email panel and returns false. */
export function requireTrustedEmail(user: User | null | undefined): boolean {
  if (isUserEmailTrusted(user)) return true;
  useVerifyEmailGateStore.getState().open();
  return false;
}
