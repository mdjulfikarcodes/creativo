"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StudioCard from "@/components/cards/StudioCard";
import SectionHeading from "@/components/shared/SectionHeading";

type Studio = {
  _id?: string;
  id?: string;
  title?: string;
  category?: string;
  location?: string;
  overview?: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  hourlyRate?: number | string;
  securityDeposit?: number | string;
  maxCapacity?: number | string;
  capacity?: number | string;
  rating?: number | string;
  reviews?: number | string;
  reviewList?: { user: string; rating: number; comment: string }[];
  price?: number | string;
  amenities?: string[] | string;
  ownerEmail?: string;
};

export default function FeaturedStudios() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStudios() {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
      if (!baseUrl) {
        setError("Server URL is not configured.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${baseUrl}/studio?limit=6`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load studios");
        }

        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : data?.data || data?.studios || [];

        if (!cancelled) {
          setStudios(list.slice(0, 6));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load studios");
          setLoading(false);
        }
      }
    }

    loadStudios();

    return () => {
      cancelled = true;
    };
  }, []);

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

        {loading && (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-gray-100 dark:bg-[#121212]" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-12 text-center py-10 text-red-500 dark:text-rose-400">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && studios.length === 0 && (
          <div className="mt-12 text-center text-gray-500 py-10">
            No featured studios available at the moment.
          </div>
        )}

        {!loading && !error && studios.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <StudioCard key={studio._id || studio.id} studio={studio} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
