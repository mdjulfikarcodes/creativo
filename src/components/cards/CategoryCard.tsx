import Link from "next/link";
import { cn } from "cn";

import {
  getCategoryHref,
  type StudioCategory,
} from "@/lib/data/categories";

export type CategoryCardProps = {
  category: StudioCategory;
  /** Overrides the default `/studios?category=[slug]` destination. */
  href?: string;
  className?: string;
};

export default function CategoryCard({
  category,
  href,
  className,
}: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Link
      href={href ?? getCategoryHref(category.slug)}
      className={cn(
        "group flex flex-col items-center rounded-xl border border-gray-200 bg-white px-5 py-8 text-center transition-all hover:border-violet-500/50 hover:shadow-md dark:border-white/5 dark:bg-[#121212] dark:hover:border-white/10 dark:hover:bg-[#151515]",
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#8b5cf6] transition-colors group-hover:bg-[#8b5cf6]/20">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>

      <h3 className="mt-5 text-base font-bold text-gray-900 dark:text-white">{category.title}</h3>
      <p className="mt-1 text-sm font-semibold text-[#8b5cf6]">
        {category.count}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
        {category.description}
      </p>
    </Link>
  );
}
