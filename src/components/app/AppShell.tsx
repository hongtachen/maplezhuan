"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { AppProvider } from "./AppContext";
import BottomNav from "./BottomNav";
import AppSidebar from "./AppSidebar";
import RouteTransition from "@/components/motion/RouteTransition";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

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
      <AppSidebar />

      <div className="min-h-dvh flex flex-col md:pl-16">
        <main
          className={`overflow-x-clip ${hideBottomNav ? "" : "pb-20 md:pb-0"}`}
        >
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>

      <AnimatePresence initial={false}>
        {!hideBottomNav && <BottomNav key="bottom-nav" />}
      </AnimatePresence>
    </AppProvider>
  );
}
