"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppProvider } from "./AppContext";
import BottomNav from "./BottomNav";
import AppSidebar from "./AppSidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Hide global navigation on specific dynamic routes to free up screen real estate
  const isChatRoom =
    pathname.startsWith("/messages/") && pathname !== "/messages";
  const isListingDetail =
    pathname.startsWith("/listing/") || pathname.startsWith("/sublet/");
  const isProfileInner =
    pathname.startsWith("/profile/") && pathname !== "/profile";
  const isSellerOnboarding = pathname === "/seller-onboarding";
  const isPublishInner =
    pathname.startsWith("/publish/") && pathname !== "/publish";
  const hideBottomNav =
    isChatRoom ||
    isListingDetail ||
    isProfileInner ||
    isSellerOnboarding ||
    isPublishInner;

  return (
    <AppProvider>
      {/* Desktop left sidebar */}
      <AppSidebar />

      {/* Main content — offset by sidebar on desktop, padded for bottom nav on mobile */}
      <div className="min-h-dvh flex flex-col md:pl-16">
        <main className={`${hideBottomNav ? "" : "pb-20 md:pb-0"}`}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      {!hideBottomNav && <BottomNav />}
    </AppProvider>
  );
}
