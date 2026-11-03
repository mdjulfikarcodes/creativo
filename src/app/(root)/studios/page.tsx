import { Suspense } from "react";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";

import { parseStudioList } from "@/lib/studios";
import type { Studio } from "@/lib/types";

// ১. মেইন পেজ
export default function StudiosPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Explore Studios</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Find and book the perfect space for your next creative project.</p>
        </div>

        {/* ২. ডাটা ফেচিং কম্পোনেন্টকে Suspense দিয়ে ঘিরে দেওয়া হলো */}
        <Suspense fallback={<StudiosLoadingSkeleton />}>
          <StudiosList />
        </Suspense>
        
      </div>
    </main>
  );
}

// ৩. ডাটা ফেচিং এবং লিস্ট রেন্ডার করার কম্পোনেন্ট
async function StudiosList() {
  let dataList: Studio[] = [];

  try {
    const studios = await fetch(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/studio`, {
      cache: "no-store",
    });
    if (studios.ok) {
      dataList = parseStudioList(await studios.json());
    }
  } catch {
    // Ignore fetch failures and render the empty state below.
  }

  if (dataList.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-white/5 dark:bg-[#121212]">
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">No studios found</h2>
        <p className="text-gray-600 dark:text-gray-400">We couldn&apos;t find any studios in the database right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dataList.map((studio) => (
        <div 
          key={studio._id || studio.id} 
          className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-violet-500/50 hover:shadow-lg dark:border-white/5 dark:bg-[#121212] dark:hover:border-violet-500/50"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
            <Image
              src={studio.imageUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04"} 
              alt={studio.title || "Studio Image"} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              width={800}
              height={600}
            />
            <div className="absolute top-3 right-3 rounded-full border border-violet-500/30 bg-black/60 px-3 py-1 text-xs font-semibold text-violet-300 backdrop-blur-md">
              {studio.category || "Studio"}
            </div>
          </div>

          {/* কন্টেন্ট সেকশন */}
          <div className="flex flex-1 flex-col p-5">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-violet-600 dark:text-white dark:group-hover:text-[#a78bfa]">
                {studio.title || "Untitled Studio"}
              </h3>
              <div className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800 dark:bg-white/5 dark:text-gray-300">
                <Star className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />
                <span>{studio.rating || "4.5"}</span>
              </div>
            </div>
            
            <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4 text-violet-500" />
              <span className="line-clamp-1">{studio.location || "Location not specified"}</span>
            </div>

            {/* প্রাইস এবং বাটন */}
            <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/5">
              <div className="flex items-baseline gap-1 font-bold text-gray-900 dark:text-white">
                <span>{studio.hourlyRate || "0"}</span>
                <span className="text-xs font-semibold text-violet-500 dark:text-violet-400">SAR</span>
                <span className="text-sm font-normal text-gray-500">/hr</span>
              </div>
              <Link 
                href={`/studios/${studio._id || studio.id}`}
                className="text-sm font-medium text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ৪. লোডিং স্কেলেটন
function StudiosLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#121212]">
          <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-slate-800" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="mt-4 h-8 w-full rounded bg-gray-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
