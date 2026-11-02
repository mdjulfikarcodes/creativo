import type { Metadata } from "next";
import HowBookingWorks from "@/components/home/HowBookingWorks";
import HostGuarantee from "@/components/home/HostGuarantee";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See how Creativo takes you from concept storyboard to a confirmed shoot day in four straightforward steps.",
};

export default function HowItWorksPage() {
  return (
    <main className="bg-[#0a0a0a]">
      <section className="border-b border-white/5 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
            From Brief to Call Sheet
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            How Creativo Works
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            Transparent pricing, verified spaces, and a team on standby from
            your first search to your final wrap.
          </p>
        </div>
      </section>

      <HowBookingWorks />
      <HostGuarantee />
    </main>
  );
}
