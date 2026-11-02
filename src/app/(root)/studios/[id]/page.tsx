import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MapPin, Star, Users } from "lucide-react";

import { StudioCard } from "@/components/cards";
import SectionHeading from "@/components/shared/SectionHeading";
import {
  getCategoryBySlug,
  getCategoryHref,
} from "@/lib/data/categories";
import { studios } from "@/lib/data/studios";
import {
  getSimilarStudios,
  getStudioById,
} from "@/lib/api/studios";

type StudioPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return studios.map((studio) => ({ id: studio.id }));
}

export async function generateMetadata({
  params,
}: StudioPageProps): Promise<Metadata> {
  const { id } = await params;
  const studio = await getStudioById(id);

  if (!studio) {
    return { title: "Studio Not Found" };
  }

  return {
    title: studio.title,
    description: studio.description,
  };
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { id } = await params;
  const studio = await getStudioById(id);

  if (!studio) {
    notFound();
  }

  const category = getCategoryBySlug(studio.categorySlug);
  const similarStudios = await getSimilarStudios(studio);

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

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div className="min-w-0">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/5 bg-black">
              <Image
                src={studio.image}
                alt={studio.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <Link
                href={getCategoryHref(studio.categorySlug)}
                className="absolute left-4 top-4 rounded-md bg-[#8b5cf6] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#7c3aed]"
              >
                {studio.category}
              </Link>
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[#8b5cf6] text-[#8b5cf6]" />
                  <span className="font-semibold text-white">
                    {studio.rating.toFixed(2)}
                  </span>
                  <span className="text-gray-500">
                    ({studio.reviews} reviews)
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <MapPin className="h-4 w-4" />
                  {studio.location}
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Users className="h-4 w-4" />
                  Up to {studio.capacity} people
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {studio.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-400">
                {studio.description}
              </p>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-500">
                {category
                  ? `Listed under ${category.title} — ${category.description.toLowerCase()}.`
                  : "A certified Creativo production space."}{" "}
                The host provides a full walkthrough on arrival, and our team is
                available throughout your call sheet for anything the space
                needs.
              </p>
            </div>

            <div className="mt-10 border-t border-white/5 pt-8">
              <h2 className="text-lg font-bold text-white">
                Included amenities
              </h2>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {studio.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-3 rounded-lg border border-white/5 bg-[#121212] px-4 py-3 text-sm text-gray-300"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6]/15 text-[#8b5cf6]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Booking Card */}
          <aside className="h-fit rounded-2xl border border-white/5 bg-[#121212] p-6 lg:sticky lg:top-24">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">
                ${studio.price}
              </span>
              <span className="text-sm text-gray-500">/hr</span>
            </div>

            <dl className="mt-5 space-y-3 border-t border-white/5 pt-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-400">Capacity</dt>
                <dd className="text-white">Up to {studio.capacity} people</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-400">Minimum booking</dt>
                <dd className="text-white">2 hours</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-400">Location</dt>
                <dd className="text-white">{studio.location}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-400">Host response</dt>
                <dd className="text-white">Within 1 hour</dd>
              </div>
            </dl>

            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-[#8b5cf6] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7c3aed]"
            >
              Request Booking
            </button>
            <p className="mt-3 text-center text-xs text-gray-500">
              No charge until your host confirms the shoot.
            </p>

            <div className="mt-6 rounded-lg border border-white/5 bg-[#0a0a0a] p-4">
              <p className="text-xs leading-relaxed text-gray-400">
                Every Creativo booking includes $1M liability protection and
                24/7 production support.
              </p>
            </div>
          </aside>
        </div>

        {/* Similar Studios */}
        {similarStudios.length > 0 && (
          <div className="mt-16 border-t border-white/5 pt-14">
            <SectionHeading
              align="left"
              eyebrow="Keep Exploring"
              title="Similar Studios"
              description="More verified spaces that match this production style."
            />

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {similarStudios.map((similar) => (
                <StudioCard key={similar.id} studio={similar} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
