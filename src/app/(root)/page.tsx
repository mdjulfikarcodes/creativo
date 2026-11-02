import { Suspense } from "react";
import HeroSlider from "@/components/home/HeroSlider";
import StudioCategories from "@/components/home/StudioCategories";
import FeaturedStudios from "@/components/home/FeaturedStudios";
import HowBookingWorks from "@/components/home/HowBookingWorks";
import HostGuarantee from "@/components/home/HostGuarantee";

export default function HomePage() {
  return (
    <>
      {/* ১. HeroSlider-কে Suspense দিয়ে ঘিরে দাও */}
      <Suspense fallback={<div className="w-full h-[85vh] min-h-[600px] bg-black animate-pulse" />}>
        <HeroSlider />
      </Suspense>

      <StudioCategories />

      {/* ২. FeaturedStudios-কেও Suspense দিয়ে ঘিরে দাও */}
      <Suspense fallback={<div className="h-96 bg-[#0a0a0a] animate-pulse" />}>
        <FeaturedStudios />
      </Suspense>

      <HowBookingWorks />
      <HostGuarantee />
    </>
  );
}