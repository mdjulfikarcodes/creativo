"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import StudioCard from "@/components/cards/StudioCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

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

  const page = Number(searchParams.get("page")) || 1;
  const categoryFromUrl = searchParams.get("category") || "";
  const searchFromUrl = searchParams.get("search") || "";

  const [category, setCategory] = useState(categoryFromUrl);
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");

  const [studios, setDataList] = useState<Studio[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(LIMIT));
        if (category) params.set("category", category);
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (location) params.set("location", location);

        if (price) {
          const [minPrice, maxPrice] = price.split("-");
          if (minPrice) params.set("minPrice", minPrice);
          if (maxPrice && maxPrice !== "+") params.set("maxPrice", maxPrice);
        }

        if (capacity) {
          const [minCapacity, maxCapacity] = capacity.split("-");
          if (minCapacity) params.set("minCapacity", minCapacity);
          if (maxCapacity && maxCapacity !== "+") params.set("maxCapacity", maxCapacity);
        }

        const url = `${baseUrl}/studio?${params.toString()}`;

        const response = await fetch(url, {
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load studios");
        }

        const json = await response.json();

        if (cancelled) return;

        const rawList = Array.isArray(json)
          ? json
          : json?.data || json?.studios || [];
        setDataList(rawList);

        if (json?.meta && typeof json.meta.totalPages === "number") {
          setTotalPages(json.meta.totalPages);
        } else {
          setTotalPages(1);
        }

        setError(null);
      } catch (err: unknown) {
        if (cancelled) return;
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

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [page, category, debouncedSearch, location, price, capacity]);

  const goToPage = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    router.push(
      `/studios?page=${validPage}&category=${encodeURIComponent(category)}`
    );
  };


  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setLocation("");
    setPrice("");
    setCapacity("");
    setCategory("");
    router.push("/studios");
  };

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

  if (loading) {
    return <StudiosLoadingSkeleton />;
  }

  if (studios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Search className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No studios match your search</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search terms.</p>
        
        
        <Button 
          onClick={handleClearFilters}
          className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2"
        >
          Clear filters
        </Button>
      </div>
    );
  }

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
            className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm dark:border-white/5 dark:bg-[#121212] dark:text-white"
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
          <div className="aspect-4/3 w-full bg-gray-200 dark:bg-slate-800" />
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