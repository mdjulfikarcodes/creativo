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
      <Suspense fallback={<div className="w-full h-[85vh] min-h-150 bg-black animate-pulse" />}>
        <HeroSlider />
      </Suspense>

      <StudioCategories />

      <Suspense fallback={<div className="h-96 bg-[#0a0a0a] animate-pulse" />}>
        <FeaturedStudios />
      </Suspense>

      <div id="how-it-works">
        <HowBookingWorks />
      </div>

      <HostGuarantee />

      <div id="about">
        <AboutPage />
      </div>
    </>
  );
}