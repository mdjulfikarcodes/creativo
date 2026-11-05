import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* ক্রিয়েটিভ ইলাস্ট্রেশন */}
      <div className="relative mb-8">
        <div className="absolute inset-0 -z-10 blur-3xl">
          <div className="mx-auto h-32 w-32 rounded-full bg-violet-500/30" />
        </div>
        <div className="flex items-center gap-2 text-violet-500">
          <Compass className="h-16 w-16 animate-[spin_8s_linear_infinite]" />
        </div>
      </div>

      <p className="text-sm font-semibold uppercase tracking-widest text-violet-500">
        Error 404
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-6xl">
        Lost in the studio?
      </h1>
      <p className="mt-4 max-w-md text-sm text-gray-500 dark:text-gray-400 md:text-base">
        The page you are looking for was moved, removed, or never existed.
        Let&apos;s get you back to a space that inspires you.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className={buttonVariants({
            className: "h-11 gap-2 bg-violet-600 text-white hover:bg-violet-700",
          })}
        >
          <Home className="h-4 w-4" />
          Return to Home
        </Link>
        <Link
          href="/studios"
          className={buttonVariants({
            variant: "outline",
            className: "h-11 gap-2",
          })}
        >
          <Search className="h-4 w-4" />
          Explore Studios
        </Link>
      </div>
    </div>
  );
}