"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { AlertCircle, Loader2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import StudioForm from "@/app/(dashboard)/dashboard/add-studio/StudioForm";
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

async function fetchStudioById(id: string): Promise<Studio | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
  if (!baseUrl) return null;
  try {
    const res = await fetch(`${baseUrl}/studio/${encodeURIComponent(id)}`, {
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const data = await res.json();
    const studio =
      Array.isArray(data)
        ? data[0]
        : data?.data || data?.studio || data;
    return studio && typeof studio === "object" && (studio as Studio)._id
      ? (studio as Studio)
      : null;
  } catch {
    return null;
  }
}


export default function EditStudioView({ id }: { id: string }) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();

  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notOwner, setNotOwner] = useState(false);

  const userEmail = (session?.user?.email ?? "").trim().toLowerCase();

  useEffect(() => {
    const studioId = String(id ?? "");
    if (!studioId) {

      const timer = setTimeout(() => {
        setError("Studio ID is missing.");
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let active = true;
    

    const loadStudio = async () => {
      setLoading(true);

      try {
        const fetched = await fetchStudioById(studioId);
        if (!active) return;

        if (!fetched) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const owner = String(fetched.ownerEmail ?? "").trim().toLowerCase();
        if (!userEmail || owner !== userEmail) {
          setNotOwner(true);
          setLoading(false);
          return;
        }

        setStudio(fetched);
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load studio.");
        setLoading(false);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStudio();

    return () => {
      active = false;
    };
  }, [id, userEmail]);


  if (sessionPending) {
    return (

      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }


  if (!userEmail) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 mb-3 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Please log in
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          You need to be signed in to edit a studio listing.
        </p>
        <Link
          href="/login"
          className="mt-6 text-sm font-medium text-[#8b5cf6] hover:underline"
        >
          Go to login page
        </Link>
      </div>
    );
  }


  if (notFound) {
    return (
      <div className="mx-auto max-w-4xl py-12 px-4 text-center">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-600 dark:text-rose-300">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p className="text-sm">Studio not found</p>

          <p className="text-xs text-muted-foreground">
            The studio you&apos;re looking for doesn&apos;t exist or was removed.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-9 border-rose-500/30 bg-transparent text-rose-600 hover:bg-rose-500/15 dark:text-rose-200 dark:hover:text-white"

          onClick={() => router.push("/dashboard/my-studio")}
        >
          Back to My Studio
        </Button>
      </div>
    );
  }

  
  if (notOwner) {
    return (
      <div className="mx-auto max-w-4xl py-12 px-4 text-center">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-600 dark:text-amber-300">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p className="text-sm font-medium">Forbidden</p>
          <p className="text-xs text-muted-foreground">
            You do not own this studio.
          </p>
        </div>
        <Link
          href="/dashboard/my-studio"
          className="mt-6 text-sm font-medium text-[#8b5cf6] hover:underline"
        >
          Back to My Studio
        </Link>
      </div>
    );
  }


  if (error) {
    return (
      <div className="mx-auto max-w-md py-12 px-4">
        <div className="flex flex-col gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
          <Button
            type="button"
            variant="outline"

            onClick={() => router.push("/dashboard/my-studio")}
            className="h-9 border-rose-500/30 bg-transparent text-rose-600 hover:bg-rose-500/15 dark:text-rose-200 dark:hover:text-white"
          >
            Back to My Studio
          </Button>
        </div>
      </div>
    );
  }


  if (loading) {
    return (

      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }


  return studio ? (
    <StudioForm initialStudio={studio} />
  ) : null;
}