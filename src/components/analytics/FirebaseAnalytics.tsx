"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, setAnalyticsCollection } from "@/lib/firebase/config";

/** GA4: skip localhost; pause collection on /admin. */
export default function FirebaseAnalytics() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      void setAnalyticsCollection(false);
      return;
    }
    void initAnalytics().then(() => setAnalyticsCollection(true));
  }, [isAdmin]);

  return null;
}
