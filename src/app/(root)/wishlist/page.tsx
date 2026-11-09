"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import StudioCard from "@/components/cards/StudioCard";
import type { Studio } from "@/lib/types";

export default function WishlistPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
    if (!baseUrl) return setLoading(false);

    setLoading(true);
    setError(null);

    fetch(`${baseUrl}/wishlist`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load wishlist");
        return res.json();
      })
      .then((data) => {
        setStudios(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load wishlist.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-6">
        <h1 className="text-2xl font-bold mb-6">Wishlist</h1>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">Loading wishlist…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-6">
        <h1 className="text-2xl font-bold mb-6">Wishlist</h1>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <p className="text-rose-600 dark:text-rose-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-6">
      <h1 className="text-2xl font-bold mb-6">Wishlist</h1>
      {!studios.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-bold">No saved studios</h2>
          <Link
            href="/studios"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7c3aed]"
          >
            Explore Studios
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {studios.map((s) => <StudioCard key={s._id || s.id} studio={s} />)}
        </div>
      )}
    </div>
  );
}
