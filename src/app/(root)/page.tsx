"use client";

import dynamic from "next/dynamic";
import StudioCategories from "@/components/home/StudioCategories";
import FeaturedStudios from "@/components/home/FeaturedStudios";
import HowBookingWorks from "@/components/home/HowBookingWorks";
import HostGuarantee from "@/components/home/HostGuarantee";

const HeroSlider = dynamic(() => import("@/components/home/HeroSlider"), {
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
