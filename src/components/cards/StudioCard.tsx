import Link from "next/link";
import Image from "next/image";
import { cn } from "cn";
import { Heart, MapPin, Star, Users } from "lucide-react";

import { getCategoryHref } from "@/lib/data/categories";
import type { Studio } from "@/lib/data/studios";

export type StudioCardProps = {
  studio: Studio;
  /** Overrides the default `/studios/[id]` destination. */
  href?: string;
  imageSizes?: string;
  className?: string;
};

export default function StudioCard({
  studio,
  href,
  imageSizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className,
}: StudioCardProps) {
  const studioHref = href ?? `/studios/${studio.id}`;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#121212] transition-colors hover:border-white/10",
        className
      )}
    >
      {/* Media */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
        <Image
          src={studio.image}
          alt={studio.title}
          fill
          sizes={imageSizes}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />

        <Link
          href={getCategoryHref(studio.categorySlug)}
          className="absolute left-3 top-3 rounded-md bg-[#8b5cf6] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#7c3aed]"
        >
          {studio.category}
        </Link>

        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Users className="h-3.5 w-3.5" />
          Up to {studio.capacity}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <Star className="h-4 w-4 shrink-0 fill-[#8b5cf6] text-[#8b5cf6]" />
            <span className="text-sm font-semibold text-white">
              {studio.rating.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">({studio.reviews})</span>
          </div>

          <div className="flex min-w-0 items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{studio.location}</span>
          </div>
        </div>

        <h3 className="mt-3 text-lg font-bold leading-snug text-white">
          <Link
            href={studioHref}
            className="transition-colors hover:text-[#a78bfa]"
          >
            {studio.title}
          </Link>
        </h3>

        <p className="mt-2 mb-5 line-clamp-2 text-sm leading-relaxed text-gray-400">
          {studio.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/5 pt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">
              ${studio.price}
            </span>
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
