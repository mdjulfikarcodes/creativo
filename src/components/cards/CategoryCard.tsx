import Link from "next/link";
import { cn } from "cn";

export type CategoryCardProps = {
  category: { slug: string; title: string; description: string };
  href?: string;
  className?: string;
};

export default function CategoryCard({
  category,
  href,
  className,
}: CategoryCardProps) {
  const link = href ?? `/studios?category=${encodeURIComponent(category.title)}`;

  return (
    <Link
      href={link}
      className={cn(
        "group flex flex-col items-center rounded-xl border border-gray-200 bg-white px-5 py-8 text-center transition-all hover:border-violet-500/50 hover:shadow-md dark:border-white/5 dark:bg-[#121212] dark:hover:border-white/10 dark:hover:bg-[#151515]",
        className
      )}
    >
      <h3 className="mt-5 text-base font-bold text-gray-900 dark:text-white">
        {category.title}
      </h3>
      <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
        {category.description}
      </p>
    </Link>
  );
}
