import { Suspense } from "react";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import StudioCard from "@/components/cards/StudioCard";
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
        <StudioCard key={studio._id || studio.id} studio={studio} />
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
