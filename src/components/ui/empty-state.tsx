"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

type EmptyStateProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`
        rounded-2xl border p-12 text-center
        border-gray-200 bg-white shadow-sm
        dark:border-white/5 dark:bg-[#121212]
        ${className ?? ""}
      `}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
        <Icon className="h-7 w-7" />
      </div>

      <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>

      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="mt-6">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            {ctaLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
