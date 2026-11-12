"use client";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import EditStudioView from "@/components/studio/EditStudioView";

export default function EditStudioPage() {
  const { id } = useParams();

  const studioId = id ? String(id) : "";

  if (!studioId) {
    return (
      <div className="mx-auto max-w-md py-12 px-4 text-center">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-600 dark:text-rose-300">
          <p className="text-sm font-medium">Studio not found</p>
          <p className="text-xs text-muted-foreground">
            No studio id was provided in the URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <Suspense fallback={<EditStudioSkeleton />}>
        <EditStudioView id={studioId} />
      </Suspense>
    </div>
  );
}


function EditStudioSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-12 px-4">
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
      <div className="space-y-4 p-6">
        <div className="h-20 bg-muted rounded-lg" />
        <div className="h-10 bg-muted rounded w-2/3" />
        <div className="h-10 bg-muted rounded w-1/3" />
        <div className="h-10 bg-muted rounded" />
      </div>
      <div className="space-y-4 p-6">
        <div className="h-20 bg-muted rounded-lg" />
        <div className="h-10 bg-muted rounded w-1/2" />
        <div className="h-10 bg-muted rounded w-1/2" />
      </div>
      <div className="flex justify-end gap-2">
        <div className="h-10 w-20 bg-muted rounded" />
        <div className="h-10 w-20 bg-muted rounded" />
      </div>
    </div>
  );
}
