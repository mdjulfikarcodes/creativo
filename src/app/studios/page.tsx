import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { cn } from "cn";

import { StudioCard } from "@/components/cards";
import {
  getCategoryBySlug,
  getCategoryHref,
  studioCategories,
} from "@/lib/data/categories";
import { getStudiosByCategory, studios } from "@/lib/data/studios";

export const metadata: Metadata = {
  title: "Explore Studios",
  description:
    "Browse verified photo studios, sound stages, podcast rooms, music suites, and art workshops by the hour.",
};

type StudiosPageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default function StudiosPage({ searchParams }: StudiosPageProps) {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Page Header */}
      <section className="border-b border-white/5 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
            Curated Production Spaces
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Explore Studios
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            Every space is inspected for power, acoustics, and production
            readiness before it is listed. Filter by category to find your next
            set.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<StudiosGridSkeleton />}>
            <StudiosResults searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

async function StudiosResults({ searchParams }: StudiosPageProps) {
  const params = await searchParams;
  const requested = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const activeCategory = requested
    ? getCategoryBySlug(requested)
    : undefined;
  const results = getStudiosByCategory(activeCategory?.slug);

  return (
    <>
      {/* Category Filters */}
      <nav aria-label="Filter studios by category" className="flex flex-wrap gap-2">
        <FilterChip href="/studios" active={!activeCategory}>
          All Studios
        </FilterChip>
        {studioCategories.map((category) => (
          <FilterChip
            key={category.slug}
            href={getCategoryHref(category.slug)}
            active={activeCategory?.slug === category.slug}
          >
            {category.title}
          </FilterChip>
        ))}
      </nav>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-400">
          Showing{" "}
          <span className="font-semibold text-white">{results.length}</span>{" "}
          {results.length === 1 ? "studio" : "studios"}
          {activeCategory ? ` in ${activeCategory.title}` : ""}
        </p>
        <p className="hidden text-xs text-gray-500 sm:block">
          {studios.length} total verified spaces
        </p>
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((studio) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/5 bg-[#121212] px-6 py-16 text-center">
          <h2 className="text-lg font-bold text-white">
            No studios in this category yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
            New spaces are added every week. Browse all studios or join the
            dispatch to hear when this category opens up.
          </p>
          <Link
            href="/studios"
            className="mt-6 inline-flex rounded-lg bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7c3aed]"
          >
            Browse All Studios
          </Link>
        </div>
      )}
    </>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-[#8b5cf6] bg-[#8b5cf6] text-white"
          : "border-white/10 bg-[#121212] text-gray-400 hover:border-white/20 hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}

function StudiosGridSkeleton() {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-10 w-28 animate-pulse rounded-full bg-white/5"
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-white/5 bg-[#121212]"
          >
            <div className="aspect-[4/3] animate-pulse bg-white/5" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-white/5" />
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-10 w-full animate-pulse rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
