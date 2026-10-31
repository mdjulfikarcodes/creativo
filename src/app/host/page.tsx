import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { GuaranteeCard, StepCard } from "@/components/cards";
import SectionHeading from "@/components/SectionHeading";
import { guarantees, hostingSteps } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Host Your Space",
  description:
    "List your photo studio, sound stage, podcast room, or workshop on Creativo and earn from certified productions.",
};

const hostStats = [
  { value: "$8.5K", label: "Average monthly host earnings" },
  { value: "18K+", label: "Verified creators on platform" },
  { value: "48hr", label: "Payouts after every confirmed shoot" },
];

export default function HostPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Page Header */}
      <section className="border-b border-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
            Become a Host
          </p>
          <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                Turn your creative space into a production destination.
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-gray-400 sm:text-base">
                Join the hosts earning from commercial photo shoots, music
                sessions, and broadcast productions. We handle verification,
                payments, and creator support.
              </p>
            </div>

            <a
              href="mailto:hosts@creativo.com?subject=List%20my%20studio%20on%20Creativo"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7c3aed]"
            >
              Talk to the Host Team
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {hostStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/5 bg-[#121212] px-6 py-5"
              >
                <dt className="text-xs text-gray-500">{stat.label}</dt>
                <dd className="mt-2 text-2xl font-bold text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Hosting Steps */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Three Steps to Live"
            title="From walkthrough to first booking"
            description="A short verification process, then your calendar and payouts run themselves."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hostingSteps.map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>
        </div>
      </section>

      {/* Host Coverage */}
      <section className="border-t border-white/5 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Protected on Every Shoot"
            title="Hosts are covered"
            description="The same guarantees that protect creators protect your space, your gear, and your calendar."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((guarantee) => (
              <GuaranteeCard key={guarantee.title} guarantee={guarantee} />
            ))}
          </div>

          <div className="mt-16 flex flex-col gap-8 rounded-2xl bg-[#7c3aed] px-8 py-10 sm:px-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                Ready to list your space?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-violet-100 sm:text-base">
                Send us your studio details and our host team will schedule a
                walkthrough within two business days.
              </p>
            </div>

            <a
              href="mailto:hosts@creativo.com?subject=List%20my%20studio%20on%20Creativo"
              className="shrink-0 self-start rounded-lg bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black lg:self-auto"
            >
              List Your Studio Now
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
