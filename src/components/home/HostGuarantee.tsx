import Link from "next/link";

import { GuaranteeCard } from "@/components/cards";
import SectionHeading from "@/components/shared/SectionHeading";
import { guarantees } from "@/lib/data/content";

export default function HostGuarantee() {
  return (
    <section
      id="host-guarantee"
      aria-labelledby="host-guarantee-heading"
      className="w-full bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="host-guarantee-heading"
          eyebrow="Enterprise Peace of Mind"
          title="Host Guarantee & Creator Support"
          description="Built with the strict compliance, insurance, and equipment standards required by independent makers and global agencies alike."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map((guarantee) => (
            <GuaranteeCard key={guarantee.title} guarantee={guarantee} />
          ))}
        </div>

        {/* Host CTA Banner */}
        <div className="mt-16 flex flex-col gap-8 rounded-2xl bg-[#7c3aed] px-8 py-10 sm:px-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              Have an empty studio or creative workspace?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-violet-100 sm:text-base">
              List your space on Creativo to earn up to SAR 32,000/month hosting
              commercial photo shoots, music sessions, and creative productions.
            </p>
          </div>

          <Link
            href="/host"
            className="shrink-0 self-start rounded-lg bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black lg:self-auto"
          >
            List Your Studio Now
          </Link>
        </div>
      </div>
    </section>
  );
}
