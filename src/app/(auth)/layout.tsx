import type { ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const benefits = [
  "Verified, production-ready spaces",
  "Instant hourly booking with clear pricing",
  "Trusted by 18,000+ creators",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white transition-colors duration-200 dark:bg-[#0a0a0a] lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-[#08040f] px-12 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/4 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#8b5cf6]/25 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px]"
        />

        <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6] shadow-lg shadow-purple-500/30">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </span>
          <span className="text-2xl font-bold tracking-tight text-white">
            Creativo<span className="text-[#8b5cf6]">.</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] font-medium tracking-[0.16em] text-purple-200 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
            Creative studio rentals
          </span>

          <h2 className="mt-6 text-4xl leading-[1.1] font-bold tracking-tight text-white xl:text-5xl">
            Spaces built for your next{" "}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#f0abfc] bg-clip-text text-transparent">
              big idea.
            </span>
          </h2>

          <p className="mt-5 text-base leading-relaxed text-gray-400">
            From daylight lofts to broadcast soundstages — book the perfect
            creative space by the hour, all in one place.
          </p>

          <ul className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6]/15 text-[#a78bfa]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-gray-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-gray-300">
            &ldquo;Creativo made it ridiculously easy to find a cyc wall studio
            for our campaign shoot. Booked it in under five minutes.&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-fuchsia-500 text-xs font-semibold text-white">
              SR
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Sara Rahman</p>
              <p className="text-xs text-gray-400">
                Creative Director, Studio Nine
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between px-5 py-6 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 lg:invisible"
            aria-label="Creativo home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8b5cf6]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </span>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Creativo<span className="text-[#8b5cf6]">.</span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to home
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pt-4 pb-12 sm:px-8">
          <div className="w-full max-w-[26rem]">{children}</div>
        </div>
      </main>
    </div>
  );
}
