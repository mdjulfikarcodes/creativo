"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { getStudioById } from "@/lib/studios";
import type { Studio } from "@/lib/types";
import StudioForm from "@/app/(dashboard)/dashboard/add-studio/StudioForm";
import { Button } from "@/components/ui/button";

// Client component that renders the edit studio view for a given studio id.
// It handles session loading, authentication, fetching the studio,
// ownership checking, and rendering the shared StudioForm in edit mode.
export default function EditStudioView({ id }: { id: string }) {
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
      setError("Studio ID is missing.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    // GET /studio/:id with credentials: include
    getStudioById(studioId)
      .then((fetched) => {
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
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load studio.");
        setLoading(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, userEmail]);

  // While the session is still resolving, show a placeholder skeleton.
  if (sessionPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  // User is not logged in.
  if (!userEmail) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
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

  // Studio could not be found.
  if (notFound) {
    return (
      <div className="mx-auto max-w-4xl py-12 px-4 text-center">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-600 dark:text-rose-300">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p className="text-sm">Studio not found</p>
          <p className="text-xs text-muted-foreground">
            The studio you're looking for doesn't exist or was removed.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-9 border-rose-500/30 bg-transparent text-rose-600 hover:bg-rose-500/15 dark:text-rose-200 dark:hover:text-white"
          onClick={() => window.location.href = "/dashboard/my-studio"}
        >
          Back to My Studio
        </Button>
      </div>
    );
  }

  // The logged-in user does not own this studio.
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

  // A network or fetch error occurred.
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
            onClick={() => window.location.href = "/dashboard/my-studio"}
            className="h-9 border-rose-500/30 bg-transparent text-rose-600 hover:bg-rose-500/15 dark:text-rose-200 dark:hover:text-white"
          >
            Back to My Studio
          </Button>
        </div>
      </div>
    );
  }

  // Still loading the studio data.
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  // The user is the owner: render the shared StudioForm in edit mode.
  return studio ? (
    <StudioForm initialStudio={studio} />
  ) : null;
}
