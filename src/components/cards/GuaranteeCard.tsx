import { cn } from "cn";

export type GuaranteeCardProps = {
  guarantee: { title: string; description: string };
  className?: string;
};

export default function GuaranteeCard({
  guarantee,
  className,
}: GuaranteeCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-violet-500/50 hover:shadow-md dark:border-white/5 dark:bg-[#121212] dark:hover:border-white/10",
        className
      )}
    >
      <h3 className="mt-6 text-base font-bold text-gray-900 dark:text-white">
        {guarantee.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {guarantee.description}
      </p>
    </article>
  );
}
