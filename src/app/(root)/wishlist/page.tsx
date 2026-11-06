"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import StudioCard from "@/components/cards/StudioCard";
import { getBearerToken } from "@/lib/auth-client";
import type { Studio } from "@/lib/types";

export default function WishlistPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
    if (!baseUrl) return setLoading(false);
    (async () => {
      const token = await getBearerToken();
      const res = await fetch(`${baseUrl}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      setStudios(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-6">
        <h1 className="text-2xl font-bold mb-6">Wishlist</h1>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">Loading wishlist…</span>
        </div>
      </div>
    );

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
