import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";
import { MapPin, Star, Users } from "lucide-react"; // 👈 DollarSign রিমুভ করা হয়েছে

import type { Studio } from "@/lib/types";

export type StudioCardProps = {
  studio: Studio;
  href?: string;
  className?: string;
};

export default function StudioCard({ studio, href, className }: StudioCardProps) {
  const studioHref = href ?? `/studios/${studio._id || studio.id}`;
  const image = studio.imageUrl || studio.image || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04";
  const price = studio.hourlyRate || studio.price || 0;
  const capacity = studio.maxCapacity || studio.capacity || 15;
  const rating = studio.rating ? Number(studio.rating).toFixed(1) : "4.8";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-violet-500/50 hover:shadow-lg dark:border-white/5 dark:bg-[#121212] dark:hover:border-violet-500/50",
        className
      )}
    >
      {/* Media */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        <Image
          src={image}
          alt={studio.title || "Studio"}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />

        <span className="absolute left-3 top-3 rounded-md bg-[#8b5cf6] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
          {studio.category || "Studio"}
        </span>

        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Users className="h-3.5 w-3.5" />
          Up to {capacity}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <Star className="h-4 w-4 shrink-0 fill-[#8b5cf6] text-[#8b5cf6]" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{rating}</span>
            <span className="text-xs text-gray-500">({studio.reviews || 24})</span>
          </div>

          <div className="flex min-w-0 items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-violet-400" />
            <span className="truncate">{studio.location || "Riyadh"}</span>
          </div>
        </div>

        <h3 className="mt-3 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-violet-600 line-clamp-1 dark:text-white dark:group-hover:text-[#a78bfa]">
          <Link href={studioHref}>
            {studio.title || "Untitled Studio"}
          </Link>
        </h3>

        <p className="mt-2 mb-5 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {studio.overview || studio.description || "Production-ready creative workspace in Riyadh."}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-gray-100 pt-4 dark:border-white/5">
          <div className="flex items-baseline gap-1">
            {/* 👇 ডলার আইকনের জায়গায় টাকার সিম্বল */}
            <span className="text-xl font-bold text-gray-900 dark:text-white">৳</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{price}</span>
            <span className="text-sm text-gray-500">/hr</span>
          </div>

          <Link
            href={studioHref}
            className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7c3aed]"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}