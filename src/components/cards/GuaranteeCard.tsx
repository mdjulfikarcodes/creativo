import { cn } from "cn";

import type { Guarantee } from "@/lib/data/content";

export type GuaranteeCardProps = {
  guarantee: Guarantee;
  className?: string;
};

export default function GuaranteeCard({
  guarantee,
  className,
}: GuaranteeCardProps) {
  const Icon = guarantee.icon;

  return (
    <article
      className={cn(
        "rounded-xl border border-white/5 bg-[#121212] p-6 transition-colors hover:border-white/10",
        className
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#8b5cf6]">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>

      <h3 className="mt-6 text-base font-bold text-white">
        {guarantee.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-400">
        {guarantee.description}
      </p>
    </article>
  );
}
