"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Hero,
  Features,
  HowItWorks,
  Trust,
  Cities,
  CTA,
} from "@/components/sections";

/* Client wrapper */
export default function LandingClient() {
  const router = useRouter();

  const handleOpenFounder = () => router.push("/publish");
  const handleOpenBuyer = () => router.push("/");

  return (
    <>
      <Header onOpenFounder={handleOpenFounder} />

      <main>
        <Hero onOpenFounder={handleOpenFounder} onOpenBuyer={handleOpenBuyer} />
        <Cities />
        <Features />
        <HowItWorks />
        <Trust />
        <CTA onOpenFounder={handleOpenFounder} onOpenBuyer={handleOpenBuyer} />
      </main>

      <Footer />
    </>
  );
}
