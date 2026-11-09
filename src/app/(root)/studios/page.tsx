"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import StudioCard from "@/components/cards/StudioCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { parseStudioList } from "@/lib/studios";
import type { Studio } from "@/lib/types";

// Backend response shape: { data: Studio[], meta: { totalPages, ... } }
type StudioMeta = {
  totalPages: number;
};

type StudioPageResponse = {
  data?: Studio[];
  meta?: StudioMeta;
};

const LIMIT = 9;

export default function StudiosPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Explore Studios
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Find and book the perfect space for your next creative project.
          </p>
        </div>

        <Suspense fallback={<StudiosLoadingSkeleton />}>
          <StudiosList />
        </Suspense>
      </div>
    </main>
  );
}

function StudiosList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL search params: page, category, search
  const page = Number(searchParams.get("page")) || 1;
  const categoryFromUrl = searchParams.get("category") || "";
  const searchFromUrl = searchParams.get("search") || "";

  // Filter state
  const [category, setCategory] = useState(categoryFromUrl);
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");

  // Data and status state
  const [studios, setDataList] = useState<Studio[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search input local state (value held before debounce)
  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 500ms debounce: fix search value 500ms after typing, then call API
  useEffect(() => {
    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => {
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  // Fetch studios — useEffect + AbortController (cleanup aborts request)
  useEffect(() => {
    const abortController = new AbortController();
    let cancelled = false;

    (async () => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
      if (!baseUrl) {
        setError(
          "Studio API is not configured. Set NEXT_PUBLIC_SERVER_BASE_URL."
        );
        setLoading(false);
        return;
      }

      try {
        // Build query params: page, limit, category, search, location, price, capacity
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(LIMIT));
        if (category) {
          params.set("category", category);
        }
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }
        if (location) {
          params.set("location", location);
        }

        // Price filter: "0-2000" → minPrice / maxPrice
        if (price) {
          const [minPrice, maxPrice] = price.split("-");
          if (minPrice) {
            params.set("minPrice", minPrice);
          }
          if (maxPrice && maxPrice !== "+") {
            params.set("maxPrice", maxPrice);
          }
        }

        // Capacity filter: "1-5" → minCapacity / maxCapacity
        if (capacity) {
          const [minCapacity, maxCapacity] = capacity.split("-");
          if (minCapacity) {
            params.set("minCapacity", minCapacity);
          }
          if (maxCapacity && maxCapacity !== "+") {
            params.set("maxCapacity", maxCapacity);
          }
        }

        const url = `${baseUrl}/studio?${params.toString()}`;

        // Fetch request — credentials: include so session/auth works with backend
        const response = await fetch(url, {
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load studios");
        }

        const json: StudioPageResponse = await response.json();

        if (cancelled) return;

        // Parse response into Studio list
        setDataList(parseStudioList(json?.data));

        // Pagination page count from meta.totalPages
        if (json?.meta && typeof json.meta.totalPages === "number") {
          setTotalPages(json.meta.totalPages);
        } else {
          setTotalPages(1);
        }

        setError(null);
      } catch (err: unknown) {
        if (cancelled) return;
        // Ignore abort errors
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError(
          err instanceof Error ? err.message : "Failed to load studios."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    // Cleanup: cancel request on unmount or dependency change
    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [page, category, debouncedSearch, location, price, capacity]);

  // Update URL on page change
  const goToPage = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    router.push(
      `/studios?page=${validPage}&category=${encodeURIComponent(category)}`
    );
  };

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-white/5 dark:bg-[#121212]">
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          Error loading studios
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <StudiosLoadingSkeleton />;
  }

  // Empty state + CTA
  if (studios.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No studios match your search"
        description="Try adjusting your filters or search terms."
        ctaLabel="Clear filters"
        ctaHref="/studios"
      />
    );
  }

  // Build page number list: 1, 2, 3 ... totalPages
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i = i + 1) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search studios…"
            className="h-11 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm dark:border-white/5 dark:bg-[#121212] dark:text-white"
          />
        </div>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm dark:border-white/5 dark:bg-[#121212] dark:text-white"
        />
        <select
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm dark:border-white/5 dark:bg-[#121212] dark:text-white"
        >
          <option value="">Any Price</option>
          <option value="0-2000">Under ৳2,000</option>
          <option value="2000-5000">৳2,000–৳5,000</option>
          <option value="5000-">Over ৳5,000</option>
        </select>
        <select
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm dark:border-white/5 dark:bg-[#121212] dark:text-white"
        >
          <option value="">Any Capacity</option>
          <option value="1-5">1-5 people</option>
          <option value="5-10">5-10 people</option>
          <option value="10-20">10-20 people</option>
          <option value="20-">20+ people</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm dark:border-white/5 dark:bg-[#121212] dark:text-white"
        >
          <option value="">All Categories</option>
          <option value="Photo Studios">Photo Studios</option>
          <option value="Sound Stages">Sound Stages</option>
          <option value="Podcast Rooms">Podcast Rooms</option>
          <option value="Music Suites">Music Suites</option>
          <option value="Art Workshops">Art Workshops</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studios.map((studio) => (
          <StudioCard key={studio._id || studio.id} studio={studio} />
        ))}
      </div>

      <nav
        className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        aria-label="Studio pagination"
      >
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium">{studios.length}</span> studios
        </div>
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={goToPage}
          category={category}
        />
      </nav>
    </div>
  );
}

function StudiosLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#121212]"
        >
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
