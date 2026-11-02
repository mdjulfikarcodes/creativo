import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StudioCard from "@/components/cards/StudioCard";
import SectionHeading from "@/components/shared/SectionHeading";

export default async function FeaturedStudios() {
  let studiosList: any[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/studio`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const allStudios = Array.isArray(data) ? data : data.data || [];
      // প্রথম ৬টি বা ৩টি ফিচার্ড স্টুডিও নেওয়া হচ্ছে
      studiosList = allStudios.slice(0, 6);
    }
  } catch (error) {
    console.error("Failed to fetch featured studios:", error);
  }

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
          description="Hand-inspected creative hubs ready for fashion editorials, commercial video shoots, and high-fidelity sound capture in Riyadh."
          action={
            <Link
              href="/studios"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#121212] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/5"
            >
              View All Studios
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {studiosList.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studiosList.map((studio: any) => (
              <StudioCard key={studio._id || studio.id} studio={studio} />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center text-gray-500 py-10">
            No featured studios available at the moment.
          </div>
        )}
      </div>
    </section>
  );
}