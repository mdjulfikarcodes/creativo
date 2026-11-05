"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Explore Studios", href: "/studios" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "About Us", href: "/#about" },
  { name: "Host Your Space", href: "/dashboard/add-studio" },
];

const categories = [
  { name: "Photo Studios", href: "/studios?category=photo" },
  { name: "Sound Stages", href: "/studios?category=sound" },
  { name: "Podcast Rooms", href: "/studios?category=podcast" },
  { name: "Music Suites", href: "/studios?category=music" },
  { name: "Art Workshops", href: "/studios?category=art" },
];

const socials = [
  {
    name: "X",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
        <path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L5.9 22H2.8l7.5-8.6L2.4 2h6.6l4.5 6.6L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleNewsletterSubmit(event: React.FormEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const email = emailInput.value.trim();
    if (!email) return;

    setNewsletterLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setNewsletterStatus("success");
        toast.add({ type: "success", title: "Subscribed!", description: "You're on the list." });
        form.reset();
      } else {
        setNewsletterStatus("error");
        toast.add({ type: "error", title: "Subscription failed", description: "Please try again later." });
      }
    } catch {
      setNewsletterStatus("error");
      toast.add({ type: "error", title: "Subscription failed", description: "Please try again later." });
    } finally {
      setNewsletterLoading(false);
    }
  }
  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50 text-gray-900 transition-colors duration-200 dark:border-white/5 dark:bg-[#0a0a0a] dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.6fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6] shadow-md shadow-purple-500/20">
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
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Creativo<span className="text-[#8b5cf6]">.</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              The premier studio rental marketplace connecting photographers,
              filmmakers, podcasters, and creators with certified,
              production-ready creative spaces across Riyadh.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Categories */}
          <nav aria-label="Studio categories">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Categories
            </h3>
            <ul className="mt-5 space-y-3">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Production Dispatch
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Join 18,000+ creators receiving our weekly release of newly
              scouted lofts, acoustic stages, and daylight studios.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-5"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                name="email"
                type="email"
                required
                placeholder="producer@agency.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-[#8b5cf6] dark:border-white/10 dark:bg-[#121212] dark:text-white dark:placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className={`mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                  newsletterLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#8b5cf6] hover:bg-[#7c3aed]"
                }`}
              >
                {newsletterLoading ? "Subscribing..." : "Subscribe"}
              </button>
              {newsletterStatus === "success" && (
                <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">Thanks for subscribing!</p>
              )}
              {newsletterStatus === "error" && (
                <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">Something went wrong.</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center sm:justify-between dark:border-white/5">
          <p className="text-sm text-gray-500">
            © 2026 Creativo Technologies, Inc. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/privacy"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-white"
            >
              Terms of Service
            </Link>
            <Link
              href="/security"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-white"
            >
              Security Guarantee
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
