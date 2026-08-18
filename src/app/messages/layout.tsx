"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <EmailVerificationBanner />
      {children}
    </ProtectedRoute>
  );
}
