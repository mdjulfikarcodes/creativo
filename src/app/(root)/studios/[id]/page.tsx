import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MapPin, Star, Users, ShieldCheck } from "lucide-react";
import ClientImage from "@/components/shared/ClientImage";
import BookingDialog from "@/components/booking/BookingDialog";
import { extractStudio, parseStudioList } from "@/lib/studios";
import type { Studio } from "@/lib/types";

type StudioPageProps = {
  params: Promise<{ id: string }>;
};

async function getStudioData(id: string): Promise<Studio | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}/studio/${id}`, { cache: "no-store" });
    if (res.ok) {
      const studio = extractStudio(await res.json());
      if (studio) return studio;
    }
  } catch { }

  try {
    const listRes = await fetch(`${baseUrl}/studio`, { cache: "no-store" });
    if (listRes.ok) {
      const dataList = parseStudioList(await listRes.json());
      const found = dataList.find(
        (studio) => (studio._id || studio.id) === id || String(studio._id) === String(id)
      );
      if (found) return found;
    }
  } catch { }

  return null;
}

async function getSimilarStudios(currentId: string): Promise<Studio[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
  if (!baseUrl) return [];

  try {
    const res = await fetch(`${baseUrl}/studio`, { cache: "no-store" });
    if (res.ok) {
      return parseStudioList(await res.json())
        .filter((studio) => (studio._id || studio.id) !== currentId)
        .slice(0, 3);
    }
  } catch { }

  return [];
}

export async function generateMetadata({ params }: StudioPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const studio = await getStudioData(id);
    if (!studio) return { title: "Studio Details | Creativo" };
    return {
      title: `${studio.title || "Studio Details"} | Creativo`,
      description: studio.overview || studio.description || "Studio details in Creativo.",
    };
  } catch {
    return { title: "Studio Details | Creativo" };
  }
}

export default function StudioDetailPage({ params }: StudioPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-white py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/studios"
          className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all studios
        </Link>

        <Suspense fallback={<StudioDetailsSkeleton />}>
          <StudioDetails idPromise={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function StudioDetails({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = await idPromise;
  const studio = await getStudioData(id);

  if (!studio) notFound();

  const similarStudios = await getSimilarStudios(studio._id || studio.id || id);

  const imageUrl = studio.imageUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04";
  const title = studio.title || "Untitled Studio";
  const category = studio.category || "Studio";
  
  // 👇 রেটিং এবং রিভিউ ডাইনামিক করা হয়েছে
  const rating = studio.rating ? Number(studio.rating).toFixed(1) : "New";
  const reviews = studio.reviews || 0;
  const reviewList = (studio as any).reviewList || [];
  
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
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] items-start">
        
        <div className="min-w-0">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-gray-200 bg-slate-900 dark:border-white/5">
            <ClientImage
              src={imageUrl}
              alt={title}
              unoptimized
              className="h-full w-full object-cover"
              width={800}
              height={500}
            />
            <div className="absolute top-4 left-4 rounded-full border border-violet-500/30 bg-black/60 px-3 py-1.5 text-xs font-semibold text-violet-300 backdrop-blur-md">
              {category}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <div className="flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-sm text-gray-800 dark:bg-white/5 dark:text-gray-300">
                <Star className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />
                <span className="font-semibold">{rating}</span>
                <span className="text-xs text-gray-500">({reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 text-violet-500" />
                <span>{location}</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4 text-violet-500" />
                <span>Up to {maxCapacity} people</span>
              </div>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              {title}
            </h1>

            <div className="mt-6 border-t border-gray-200 pt-6 dark:border-white/5">
              <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">Space Overview</h2>
              <p className="max-w-3xl text-base leading-relaxed text-gray-700 whitespace-pre-line dark:text-gray-300">
                {overview}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-500">
                Listed under {category}. A certified Creativo production space in Riyadh.
                The host provides a complete walkthrough on arrival, with 24/7 production concierge support.
              </p>
            </div>
          </div>

          {amenities.length > 0 && (
            <div className="mt-10 border-t border-gray-200 pt-8 pb-4 dark:border-white/5">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Included Amenities & Gear</h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {amenities.map((amenity: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-white/5 dark:bg-[#121212] dark:text-gray-300"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-500 dark:text-violet-400">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 👇 কাস্টমার রিভিউ সেকশন */}
          <div className="mt-10 border-t border-gray-200 pt-8 dark:border-white/5">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
            <div className="space-y-4">
              {reviewList.length > 0 ? (
                reviewList.map((rev: any, i: number) => (
                  <div key={i} className="p-4 border rounded-xl dark:border-white/10 bg-white dark:bg-[#121212]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">{rev.user}</span>
                      <span className="flex items-center text-xs text-violet-500">
                        <Star className="h-3 w-3 fill-violet-500 mr-1" /> {rev.rating}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No reviews yet. Be the first to review this space!</p>
              )}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24 dark:border-white/5 dark:bg-[#121212]">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-violet-500 dark:text-violet-400">৳</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{hourlyRate}</span>
            <span className="text-sm font-normal text-gray-500">/hr</span>
          </div>

          <dl className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-sm dark:border-white/5">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">Max Capacity</dt>
              <dd className="font-medium text-gray-900 dark:text-white">Up to {maxCapacity} people</dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">Minimum Booking</dt>
              <dd className="font-medium text-gray-900 dark:text-white">2 hours</dd>
            </div>

            {Number(securityDeposit) > 0 && (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Security Deposit</dt>
                <dd className="font-medium text-gray-900 dark:text-white">৳ {securityDeposit} (refundable)</dd>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">Location</dt>
              <dd className="max-w-[170px] truncate text-right font-medium text-gray-900 dark:text-white" title={location}>
                {location}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">Host Response</dt>
              <dd className="font-medium text-gray-900 dark:text-white">Within 1 hour</dd>
            </div>
          </dl>

          <BookingDialog
            studioId={String(studio._id || studio.id || id)}
            studioTitle={title}
            studioImage={imageUrl}
            hourlyRate={Number(hourlyRate) || 0}
          />

          <p className="mt-3 text-center text-xs text-gray-500">
            No charge until your host confirms the reservation.
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/5 dark:bg-[#0a0a0a]">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-500 dark:text-violet-400" />
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              Every Creativo booking includes comprehensive liability protection and 24/7 production support in Riyadh.
            </p>
          </div>
        </aside>
      </div>

      {similarStudios.length > 0 && (
        <div className="mt-16 border-t border-gray-200 pt-14 dark:border-white/5">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Similar Studios</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">More verified creative spaces that match this style.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarStudios.map((similar: Studio) => (
              <div
                key={similar._id || similar.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-violet-500/50 hover:shadow-lg dark:border-white/5 dark:bg-[#121212] dark:hover:border-violet-500/50"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <ClientImage
                    src={similar.imageUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04"}
                    alt={similar.title || "Studio Image"}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 rounded-full border border-violet-500/30 bg-black/60 px-3 py-1 text-xs font-semibold text-violet-300 backdrop-blur-md">
                    {similar.category || "Studio"}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-violet-600 dark:text-white dark:group-hover:text-[#a78bfa]">
                      {similar.title || "Untitled Studio"}
                    </h3>
                    <div className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800 dark:bg-white/5 dark:text-gray-300">
                      <Star className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />
                      <span>{similar.rating || "New"}</span>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4 text-violet-500" />
                    <span className="line-clamp-1">{similar.location || "Location not specified"}</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/5">
                    <div className="flex items-baseline gap-1 font-bold text-gray-900 dark:text-white">
                      <span className="text-violet-500 dark:text-violet-400">৳</span>
                      <span>{similar.hourlyRate || "0"}</span>
                      <span className="text-sm font-normal text-gray-500">/hr</span>
                    </div>
                    <Link
                      href={`/studios/${similar._id || similar.id}`}
                      className="text-sm font-medium text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
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

function StudioDetailsSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] animate-pulse">
      <div className="space-y-6">
        <div className="aspect-[16/10] w-full rounded-2xl bg-gray-200 dark:bg-slate-800" />
        <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-slate-800" />
        <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
        <div className="h-32 w-full rounded bg-gray-200 dark:bg-slate-800" />
      </div>
      <div className="h-96 w-full rounded-2xl bg-gray-200 dark:bg-slate-800" />
    </div>
  );
}