import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { StudioCard } from "@/components/cards";
import SectionHeading from "@/components/shared/SectionHeading";
import { featuredStudios } from "@/lib/data/studios";

export default function FeaturedStudios() {
  return (
    <section
      id="featured-studios"
      aria-labelledby="featured-studios-heading"
      className="w-full bg-[#0a0a0a] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="featured-studios-heading"
          align="left"
          eyebrow="Top Rated Workspaces"
          title="Featured Creative Studios"
          description="Hand-inspected creative hubs ready for fashion editorials, commercial video shoots, and high-fidelity sound capture."
          action={
            <Link
              href="/studios"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#121212] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/5"
            >
              View All 90+ Studios
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredStudios.map((studio) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      </div>
    </section>
  );
}
