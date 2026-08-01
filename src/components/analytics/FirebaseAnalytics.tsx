"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/firebase/config";

/** Initializes GA4 Analytics once on the client. */
export default function FirebaseAnalytics() {
  useEffect(() => {
    void initAnalytics();
  }, []);

  return null;
}
