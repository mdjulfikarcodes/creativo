import { Suspense } from "react";
import HeroSlider from "@/components/home/HeroSlider";
import StudioCategories from "@/components/home/StudioCategories";
import FeaturedStudios from "@/components/home/FeaturedStudios";
import HowBookingWorks from "@/components/home/HowBookingWorks";
import HostGuarantee from "@/components/home/HostGuarantee";
import AboutPage from "@/components/shared/about";

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="w-full h-[85vh] min-h-[600px] bg-black animate-pulse" />}>
        <HeroSlider />
      </Suspense>

      <StudioCategories />

      <Suspense fallback={<div className="h-96 bg-[#0a0a0a] animate-pulse" />}>
        <FeaturedStudios />
      </Suspense>

      {/* ১. How It Works সেকশনে id দাও */}
      <div id="how-it-works">
        <HowBookingWorks />
      </div>

      <HostGuarantee />

      {/* ২. About Us সেকশনে id দাও */}
      <div id="about">
        <AboutPage />
      </div>
    </>
  );
}