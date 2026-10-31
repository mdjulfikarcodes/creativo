"use client";

import dynamic from "next/dynamic";
import StudioCategories from "@/components/StudioCategories";
import FeaturedStudios from "@/components/FeaturedStudios";
import HowBookingWorks from "@/components/HowBookingWorks";
import HostGuarantee from "@/components/HostGuarantee";

const HeroSlider = dynamic(() => import("@/components/HeroSlider"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[85vh] min-h-[600px] bg-black animate-pulse" />
  ),
});

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <StudioCategories />
      <FeaturedStudios />
      <HowBookingWorks />
      <HostGuarantee />
    </>
  );
}
