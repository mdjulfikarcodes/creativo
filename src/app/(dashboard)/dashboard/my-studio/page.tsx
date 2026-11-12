"use client";

import { useCallback, useEffect, useState } from "react"; 
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Building2, MapPin, PlusCircle, RefreshCw, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/lib/auth-client";

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

async function fetchMyStudios(ownerEmail: string): Promise<Studio[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
  if (!baseUrl) return [];
  try {
    const res = await fetch(
      `${baseUrl}/studio?ownerEmail=${encodeURIComponent(ownerEmail)}`,
      {
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data || data?.studios || [];
  } catch {
    return [];
  }
}

async function deleteStudio(id: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
  if (!baseUrl) return;
  await fetch(`${baseUrl}/studio/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
}

const FALLBACK_STUDIO_IMAGE =
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200&auto=format&fit=crop";

function studioId(studio: Studio): string {
  return String(studio._id || studio.id || "");
}

function studioImage(studio: Studio): string {
  return studio.imageUrl || studio.image || FALLBACK_STUDIO_IMAGE;
}

function studioRate(studio: Studio): string {
  const rate = studio.hourlyRate ?? studio.price;
  return rate === undefined || rate === null || rate === "" ? "—" : String(rate);
}

function studioCapacity(studio: Studio): string {
  const capacity = studio.maxCapacity ?? studio.capacity;
  return capacity === undefined || capacity === null || capacity === "" ? "—" : String(capacity);
}

function studioRating(studio: Studio): string {
  const rating = Number(studio.rating);
  return Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : "New";
}

export default function MyStudioListings() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data: session, isPending: sessionPending } = useSession();

  const userEmail = (session?.user?.email ?? "").trim().toLowerCase();

  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Studio | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);


  const loadStudios = useCallback(async (): Promise<void> => {
    if (sessionPending || !userEmail) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("My Studio - Fetching for Email:", userEmail);
      const studioList = await fetchMyStudios(userEmail);
      console.log("My Studio - Fetched Data:", studioList);
      setStudios(studioList);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load your studios.");
    } finally {
      setLoading(false);
    }
  }, [userEmail, sessionPending]);

 
  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudios();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadStudios]);

  const refresh = async (): Promise<void> => {
    await loadStudios();
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  async function handleDelete() {
    if (!deleteTarget) return;

    const id = studioId(deleteTarget);
    const title = deleteTarget.title || "this studio";

    if (!id) {
      setDeleteError("This studio is missing an id and cannot be deleted.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteStudio(id);
      toast.add({
        type: "success",
        title: "Studio deleted",
        description: `${title} has been permanently removed.`,
      });

      setStudios((prev) => prev.filter((studio) => studioId(studio) !== id));
      setDeleteTarget(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting this studio.";

      setDeleteError(message);
      toast.add({
        type: "error",
        title: "Delete failed",
        description: message,
      });
    } finally {
      setDeleting(false);
    }
  }

  const signInError =
    !sessionPending && !userEmail
      ? "Please sign in to manage your studios."
      : null;
  const displayError = error ?? signInError;
  const showSkeleton =
    (sessionPending || (loading && Boolean(userEmail))) && studios.length === 0;
  const showEmpty = !showSkeleton && !displayError && studios.length === 0;

  return (
    <div className={`min-h-screen py-12 px-4 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 ${isDark ? "border-white/5" : "border-gray-200"}`}>
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              My Studio Listings
            </h1>
            <p className={`mt-2 text-sm md:text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Manage your listed production spaces, update hourly rates, and review listings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={refresh}
              disabled={loading || !userEmail}
              className={`${isDark ? "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/dashboard/add-studio">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add New Studio
              </Button>
            </Link>
          </div>
        </div>

        {displayError && !showSkeleton && (
          <div className="flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 shrink-0" />
              <p className="text-sm">{displayError}</p>
            </div>
            {userEmail && (
              <Button
                type="button"
                variant="outline"
                onClick={refresh}
                className="h-9 border-rose-500/30 bg-transparent text-rose-600 hover:bg-rose-500/15 dark:text-rose-200 dark:hover:text-white"
              >
                Try again
              </Button>
            )}
          </div>
        )}

        {showSkeleton && (
          <div className={`border rounded-xl overflow-hidden ${isDark ? "bg-[#121212] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
            <div className="space-y-3 p-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={`h-16 animate-pulse rounded-lg ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
              ))}
            </div>
          </div>
        )}

        {showEmpty && (
          <EmptyState
            icon={Building2}
            title="You haven't added any studio yet"
            description="Publish your first production space to start receiving booking requests."
            ctaLabel="Add Studio"
            ctaHref="/dashboard/add-studio"
          />
        )}

        {studios.length > 0 && (
          <div className={`border rounded-xl overflow-hidden ${isDark ? "bg-[#121212] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className={`border-b text-xs uppercase font-semibold tracking-wider ${isDark ? "bg-white/5 border-white/5 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                  <tr>
                    <th className="px-6 py-4">Studio Space</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Hourly Rate</th>
                    <th className="px-6 py-4">Capacity</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-200"}`}>
                  {studios.map((studio) => {
                    const id = studioId(studio);
                    return (
                      <tr key={id || studio.title} className={`transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`relative w-16 h-12 rounded-md overflow-hidden shrink-0 ${isDark ? "bg-slate-800" : "bg-gray-200"}`}>
                              <Image src={studioImage(studio)} alt={studio.title || "Studio"} fill className="w-full h-full object-cover opacity-90" sizes="64px" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04"; }} />
                            </div>
                            <div>
                              <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{studio.title || "Untitled Studio"}</p>
                              <p className={`text-xs flex items-center gap-1 mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                <MapPin className="w-3 h-3" /> {studio.location || "Location not specified"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${isDark ? "bg-violet-950/40 text-violet-400 border-violet-900/50" : "bg-violet-50 text-violet-700 border-violet-200"}`}>{studio.category || "Studio"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{studioRate(studio)}</span>
                          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>/hr</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{studioCapacity(studio)} people</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-1 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            <Star className="w-4 h-4 text-violet-500 fill-violet-500" /> <span>{studioRating(studio)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/studios/${id}`} aria-label="View studio" className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                              <span className="w-4 h-4" />
                            </Link>
                            <Link href={`/dashboard/studios/edit/${id}`}>
                              <Button variant="outline" size="sm" className={`h-8 ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}>
                                <Star className="w-3.5 h-3.5 mr-1.5" /> Update
                              </Button>
                            </Link>
                            <Button type="button" variant="ghost" size="icon" onClick={() => { setDeleteError(null); setDeleteTarget(studio); }} className={`h-8 w-8 ${isDark ? "text-gray-400 hover:text-red-400 hover:bg-red-950/30" : "text-gray-500 hover:text-red-500 hover:bg-red-50"}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Dialog open={deleteTarget !== null} onOpenChange={(nextOpen) => { if (!nextOpen) closeDeleteDialog(); }}>
          <DialogContent className={`border sm:max-w-md ${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-gray-200 text-gray-900"}`}>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription className={`${isDark ? "text-slate-400" : "text-gray-500"}`}>
                {deleteTarget ? `This will permanently delete "${deleteTarget.title || "this studio"}" and remove it from our servers. This action cannot be undone.` : "This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>

            {deleteError && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-300">
                <Star className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{deleteError}</p>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" disabled={deleting} onClick={closeDeleteDialog} className={`${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void handleDelete()} disabled={deleting} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                {deleting ? (<>Deleting...</>) : (<>Delete Studio</>)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}