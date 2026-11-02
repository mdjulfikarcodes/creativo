import React, { Suspense } from 'react';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import Image from 'next/image';

// ১. মেইন পেজ (এটি আর async হবে না)
export default function StudiosPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Explore Studios</h1>
          <p className="text-gray-400 mt-2">Find and book the perfect space for your next creative project.</p>
        </div>

        {/* ২. ডাটা ফেচিং কম্পোনেন্টকে Suspense দিয়ে ঘিরে দেওয়া হলো */}
        <Suspense fallback={<StudiosLoadingSkeleton />}>
          <StudiosList />
        </Suspense>
        
      </div>
    </main>
  );
}

// ৩. ডাটা ফেচিং এবং লিস্ট রেন্ডার করার কম্পোনেন্ট (এটি async)
async function StudiosList() {
  const studios = await fetch(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/studio`, {
    cache: "no-store",
  });
  const studiosData = await studios.json();
  
  console.log("Studios data:", studiosData);

  const dataList = Array.isArray(studiosData) ? studiosData : studiosData.data || [];

  if (dataList.length === 0) {
    return (
      <div className="bg-[#121212] border border-white/5 rounded-2xl p-12 text-center">
        <h2 className="text-xl font-bold text-white mb-2">No studios found</h2>
        <p className="text-gray-400">We couldn't find any studios in the database right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dataList.map((studio: any) => (
        <div 
          key={studio._id || studio.id} 
          className="group bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all flex flex-col"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
            <Image
              src={studio.imageUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04"} 
              alt={studio.title || "Studio Image"} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              width={800}
              height={600}
            />
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-violet-300 text-xs font-semibold px-3 py-1 rounded-full border border-violet-500/30">
              {studio.category || "Studio"}
            </div>
          </div>

          {/* কন্টেন্ট সেকশন */}
          <div className="p-5 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-white line-clamp-1">{studio.title || "Untitled Studio"}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-300 bg-white/5 px-2 py-1 rounded-md">
                <Star className="w-3.5 h-3.5 text-violet-500 fill-violet-500" />
                <span>{studio.rating || "4.5"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="line-clamp-1">{studio.location || "Location not specified"}</span>
            </div>

            {/* প্রাইস এবং বাটন */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
              <div className="text-white font-bold flex items-baseline gap-1">
                <span>{studio.hourlyRate || "0"}</span>
                <span className="text-xs font-semibold text-violet-400">SAR</span>
                <span className="text-gray-400 text-sm font-normal">/hr</span>
              </div>
              <Link 
                href={`/studios/${studio._id || studio.id}`}
                className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
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

// ৪. লোডিং স্কেলেটন (যা ডাটা লোড হওয়ার আগে দেখাবে)
function StudiosLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
          <div className="aspect-[4/3] w-full bg-slate-800" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-800 rounded w-1/2" />
            <div className="h-8 bg-slate-800 rounded w-full mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}