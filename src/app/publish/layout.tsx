"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PublishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, userProfile, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // If no profile exists (legacy user) or not verified, redirect
      if (!userProfile || !userProfile.isVerifiedSeller) {
        router.replace("/seller-onboarding");
      }
    }
  }, [isLoading, isAuthenticated, userProfile, router]);

  // Prevent showing the publish page content before the redirect happens
  if (isLoading || !userProfile?.isVerifiedSeller) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-dvh bg-[#f3fbf7]">
          <div className="w-8 h-8 border-4 border-[#2f9e6d] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
