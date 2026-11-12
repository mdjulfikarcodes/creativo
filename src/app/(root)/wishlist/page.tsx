"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2, Trash2 } from "lucide-react";
import StudioCard from "@/components/cards/StudioCard";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";

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

export default function WishlistPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
      if (!baseUrl) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const tokenRes = await authClient.token();
        const token = tokenRes?.data?.token;

        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const res = await fetch(`${baseUrl}/wishlist`, {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to load wishlist (${res.status})`);
        }

        const wishlistData = await res.json();
        setStudios(Array.isArray(wishlistData) ? wishlistData : []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load wishlist.");
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const handleRemove = async (studioId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
    if (!baseUrl) return;

    setRemovingId(studioId);

    try {
      const tokenRes = await authClient.token();
      const token = tokenRes?.data?.token;

      if (!token) {
        toast.add({ type: "error", title: "Please login first" });
        return;
      }

      const res = await fetch(`${baseUrl}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studioId }),
      });

      if (!res.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      setStudios((prev) => prev.filter((s) => (s._id || s.id) !== studioId));
      
      toast.add({
        type: "success",
        title: "Removed from wishlist",
      });

    } catch (err) {
      toast.add({
        type: "error",
        title: "Could not remove",
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setRemovingId(null);
    }
  };

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
          {studios.map((s) => {
            const id = String(s._id || s.id || "");
            const isRemoving = removingId === id;

            return (
              
              <div key={id} className="relative group/card overflow-hidden rounded-2xl">
                <StudioCard studio={s} />
                
              
                <div className="absolute top-3 right-12 z-20">
                  <button
                    type="button"
                    onClick={() => handleRemove(id)}
                    disabled={isRemoving}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors"
                    title="Remove from wishlist"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}