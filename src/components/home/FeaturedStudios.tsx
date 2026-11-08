import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { connection } from "next/server"; // 👈 নতুন যোগ করা হলো
import StudioCard from "@/components/cards/StudioCard";
import SectionHeading from "@/components/shared/SectionHeading";
import { parseStudioList } from "@/lib/studios";
import type { Studio } from "@/lib/types";

// ১. মেইন কম্পোনেন্ট (সিঙ্ক্রোনাস)
export default function FeaturedStudios() {
  return (
    <section
      id="featured-studios"
      aria-labelledby="featured-studios-heading"
      className="w-full bg-white text-gray-900 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-white py-20 md:py-28"
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
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-[#121212] dark:text-white dark:hover:border-white/20 dark:hover:bg-white/5"
            >
              View All Studios
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {/* ২. Suspense বাউন্ডারি */}
        <Suspense fallback={<FeaturedStudiosSkeleton />}>
          <FeaturedStudiosList />
        </Suspense>
      </div>
    </section>
  );
}

// ৩. ডাটা ফেচিং কম্পোনেন্ট (async)
async function FeaturedStudiosList() {
  // 👇 এই লাইনটি Next.js-কে বলে দেয় যে এটি ডাইনামিক ডাটা
  await connection(); 

  let studiosList: Studio[] = [];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";
    const res = await fetch(`${baseUrl}/studio`, { next: { revalidate: 60 } });

    if (res.ok) {
      const data = await res.json();
      studiosList = parseStudioList(data).slice(0, 6);
    }
  } catch (error) {
    console.error("Failed to fetch featured studios:", error);
  }

  if (studiosList.length === 0) {
    return (
      <div className="mt-12 text-center text-gray-500 py-10">
        No featured studios available at the moment.
      </div>
    );
  }

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {studiosList.map((studio) => (
        <StudioCard key={studio._id || studio.id} studio={studio} />
      ))}
    </div>
  );
}

// ৪. লোডিং স্কেলেটন
function FeaturedStudiosSkeleton() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-80 rounded-2xl bg-gray-100 dark:bg-[#121212]" />
      ))}
    </div>
  );
}