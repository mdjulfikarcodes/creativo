import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MapPin, Star, Users, ShieldCheck } from "lucide-react";
import Image from "next/image";

type StudioPageProps = {
  params: Promise<{ id: string }>;
};

type Studio = {
  _id?: string;
  id?: string;
  title?: string;
  overview?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  rating?: string | number;
  reviews?: string | number;
  location?: string;
  hourlyRate?: string | number;
  securityDeposit?: string | number;
  maxCapacity?: string | number;
  amenities?: unknown;
};

// ---------------------------------------------------------
// ১. ডাটা ফেচিং ফাংশনসমূহ
// ---------------------------------------------------------
async function getStudioData(id: string): Promise<Studio | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}/studio/${id}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const studio = Array.isArray(data) ? data[0] : (data.data || data.studio || data);
      if (studio && (studio._id || studio.id || studio.title)) {
        return studio;
      }
    }
  } catch (err) {
    console.warn("Direct /studio/:id fetch failed:", err);
  }

  // Fallback: List fetch
  try {
    const listRes = await fetch(`${baseUrl}/studio`, {
      cache: "no-store",
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      const dataList: Studio[] = Array.isArray(listData) ? listData : (listData.data || listData.studios || []);
      const found = dataList.find(
        (s: Studio) => (s._id || s.id) === id || String(s._id) === String(id)
      );
      if (found) return found;
    }
  } catch (err) {
    console.warn("List fetch error:", err);
  }

  return null;
}

async function getSimilarStudios(currentId: string): Promise<Studio[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
  if (!baseUrl) return [];

  try {
    const res = await fetch(`${baseUrl}/studio`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const dataList: Studio[] = Array.isArray(data) ? data : (data.data || data.studios || []);
      return dataList.filter((s: Studio) => (s._id || s.id) !== currentId).slice(0, 3);
    }
  } catch (err) {
    console.warn("Error fetching similar studios:", err);
  }

  return [];
}

// ---------------------------------------------------------
// ২. মেটাডাটা জেনারেট করা
// ---------------------------------------------------------
export async function generateMetadata({ params }: StudioPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const studio = await getStudioData(id);

    if (!studio) {
      return { title: "Studio Details | Creativo" };
    }

    return {
      title: `${studio.title || "Studio Details"} | Creativo`,
      description: studio.overview || "Studio details in Creativo.",
    };
  } catch {
    return { title: "Studio Details | Creativo" };
  }
}

// ---------------------------------------------------------
// ৩. মেইন পেজ (এটি সিঙ্ক্রোনাস, কোনো এরর দেবে না)
// ---------------------------------------------------------
export default function StudioDetailPage({ params }: StudioPageProps) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/studios"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all studios
        </Link>

        {/* ৪. Suspense দিয়ে ডাটা ফেচিং কম্পোনেন্টকে ঘিরে দেওয়া হলো */}
        <Suspense fallback={<StudioDetailsSkeleton />}>
          <StudioDetails idPromise={params} />
        </Suspense>
      </div>
    </main>
  );
}

// ---------------------------------------------------------
// ৫. আসল ডাটা ফেচিং এবং UI রেন্ডারিং (async কম্পোনেন্ট)
// ---------------------------------------------------------
async function StudioDetails({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = await idPromise;
  const studio = await getStudioData(id);

  if (!studio) {
    notFound();
  }

  const similarStudios = await getSimilarStudios(studio._id || studio.id || id);

  const imageUrl = studio.imageUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04";
  const title = studio.title || "Untitled Studio";
  const category = studio.category || "Studio";
  const rating = studio.rating || "4.5";
  const reviews = studio.reviews || 24;
  const location = studio.location || "Location not specified";
  const hourlyRate = studio.hourlyRate || "0";
  const securityDeposit = studio.securityDeposit || "0";
  const maxCapacity = studio.maxCapacity || "15";
  const overview = studio.overview || studio.description || "No detailed overview provided for this studio.";

  const amenities: string[] = Array.isArray(studio.amenities)
    ? studio.amenities
    : typeof studio.amenities === "string" && studio.amenities.trim()
    ? studio.amenities.split(",").map((s: string) => s.trim())
    : [
        "High-Speed Fiber Wi-Fi",
        "Air Conditioning & Climate Control",
        "Hair & Makeup Styling Station",
        "Dedicated Equipment Load-in",
      ];

  return (
    <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
      {/* বাম পাশের মূল কন্টেন্ট */}
      <div className="min-w-0">
        {/* কভার ছবি */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/5 bg-slate-900">
          <Image
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            width={800}
            height={500}
          />
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-500/30">
            {category}
          </div>
        </div>

        {/* টাইটেল এবং তথ্য */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <div className="flex items-center gap-1 text-sm text-gray-300 bg-white/5 px-2.5 py-1 rounded-md">
              <Star className="w-3.5 h-3.5 text-violet-500 fill-violet-500" />
              <span className="font-semibold text-white">{rating}</span>
              <span className="text-gray-500 text-xs">({reviews} reviews)</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-violet-400" />
              <span>{location}</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Users className="w-4 h-4 text-violet-400" />
              <span>Up to {maxCapacity} people</span>
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>

          <div className="mt-6 border-t border-white/5 pt-6">
            <h2 className="text-lg font-bold text-white mb-3">Space Overview</h2>
            <p className="max-w-3xl text-base leading-relaxed text-gray-300 whitespace-pre-line">
              {overview}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-500">
              Listed under {category}. A certified Creativo production space in Riyadh.
              The host provides a complete walkthrough on arrival, with 24/7 production concierge support.
            </p>
          </div>
        </div>

        {/* অ্যামেনিটিজ */}
        {amenities.length > 0 && (
          <div className="mt-10 border-t border-white/5 pt-8">
            <h2 className="text-lg font-bold text-white mb-4">Included Amenities & Gear</h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {amenities.map((amenity: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-[#121212] px-4 py-3 text-sm text-gray-300"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-400">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ডান পাশের বুকিং কার্ড */}
      <aside className="h-fit rounded-2xl border border-white/5 bg-[#121212] p-6 lg:sticky lg:top-24">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">{hourlyRate}</span>
          <span className="text-xs font-semibold text-violet-400">SAR</span>
          <span className="text-gray-400 text-sm font-normal">/hr</span>
        </div>

        <dl className="mt-5 space-y-3 border-t border-white/5 pt-5 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-400">Max Capacity</dt>
            <dd className="text-white font-medium">Up to {maxCapacity} people</dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-400">Minimum Booking</dt>
            <dd className="text-white font-medium">2 hours</dd>
          </div>

          {Number(securityDeposit) > 0 && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-400">Security Deposit</dt>
              <dd className="text-white font-medium">{securityDeposit} SAR (refundable)</dd>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-400">Location</dt>
            <dd className="text-white font-medium truncate max-w-[170px] text-right" title={location}>
              {location}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-400">Host Response</dt>
            <dd className="text-white font-medium">Within 1 hour</dd>
          </div>
        </dl>

        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-[#8b5cf6] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#7c3aed]"
        >
          Request Booking
        </button>
        
        <p className="mt-3 text-center text-xs text-gray-500">
          No charge until your host confirms the reservation.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-lg border border-white/5 bg-[#0a0a0a] p-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-violet-400 mt-0.5" />
          <p className="text-xs leading-relaxed text-gray-400">
            Every Creativo booking includes comprehensive liability protection and 24/7 production support in Riyadh.
          </p>
        </div>
      </aside>

      {/* Similar Studios */}
      {similarStudios.length > 0 && (
        <div className="col-span-full mt-16 border-t border-white/5 pt-14">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Similar Studios</h2>
            <p className="text-gray-400 text-sm mt-1">More verified creative spaces that match this style.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarStudios.map((similar: Studio) => (
              <div
                key={similar._id || similar.id}
                className="group bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                  <img
                    src={similar.imageUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04"}
                    alt={similar.title || "Studio Image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-violet-300 text-xs font-semibold px-3 py-1 rounded-full border border-violet-500/30">
                    {similar.category || "Studio"}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white line-clamp-1">
                      {similar.title || "Untitled Studio"}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-300 bg-white/5 px-2 py-1 rounded-md">
                      <Star className="w-3.5 h-3.5 text-violet-500 fill-violet-500" />
                      <span>{similar.rating || "4.5"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="line-clamp-1">{similar.location || "Location not specified"}</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-white font-bold flex items-baseline gap-1">
                      <span>{similar.hourlyRate || "0"}</span>
                      <span className="text-xs font-semibold text-violet-400">SAR</span>
                      <span className="text-gray-400 text-sm font-normal">/hr</span>
                    </div>
                    <Link
                      href={`/studios/${similar._id || similar.id}`}
                      className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// ৬. লোডিং স্কেলেটন (Suspense Fallback)
// ---------------------------------------------------------
function StudioDetailsSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] animate-pulse">
      <div className="space-y-6">
        <div className="aspect-[16/10] w-full rounded-2xl bg-slate-800" />
        <div className="h-8 bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
        <div className="h-32 bg-slate-800 rounded w-full" />
      </div>
      <div className="h-96 bg-slate-800 rounded-2xl w-full" />
    </div>
  );
}