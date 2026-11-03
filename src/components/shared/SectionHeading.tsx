import type { ReactNode } from "react";
import { cn } from "cn";

export type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** Used as the `id` on the heading so sections can reference it via aria-labelledby. */
  id?: string;
  align?: "center" | "left";
  /** Optional action (e.g. a "View all" link) placed opposite the heading on larger screens. */
  action?: ReactNode;
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = "center",
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        action && "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div
        className={cn(
          align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"
        )}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
          {eyebrow}
        </p>
        <h2
          id={id}
          className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl dark:text-white"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
    </div>
  );
}
