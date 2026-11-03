import { cn } from "cn";

import type { Step } from "@/lib/data/content";

export type StepCardProps = {
  step: Step;
  className?: string;
};

export default function StepCard({ step, className }: StepCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col items-center rounded-2xl border border-gray-200 bg-white px-7 py-9 text-center transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg dark:border-white/5 dark:bg-[#121212] dark:hover:border-white/10 dark:hover:bg-[#151515]",
        className
      )}
    >
      {/* Faint top sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-2xl bg-gradient-to-b from-white/[0.03] to-transparent" />

      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#8b5cf6] text-lg font-bold text-white shadow-lg shadow-[#8b5cf6]/25 ring-1 ring-white/10">
        {step.number}
      </span>

      <h3 className="relative mt-6 text-lg font-bold text-gray-900 dark:text-white">
        {step.title}
      </h3>
      <p className="relative mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {step.description}
      </p>
    </article>
  );
}
