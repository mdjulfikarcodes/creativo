"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  // Mock authentication state (Replace with your BetterAuth/Auth context later)
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Studios", href: "/studios" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Mobile: Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/5 hover:text-white md:hidden"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              /* Close Icon */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              /* Hamburger Icon */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            )}
          </button>
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6]">
              {/* Custom Camera SVG Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Creativo<span className="text-[#8b5cf6]">.</span>
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-sm font-medium transition-colors hover:text-white ${
                  isActive ? "text-white" : "text-gray-400"
                }`}
              >
                {link.name}
                {/* Active Route Underline */}
                {isActive && (
                  <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-[#8b5cf6]"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions (Theme + Auth) */}
        <div className="flex items-center gap-3 md:gap-5">
          
          {/* Theme Toggle (Challenge 3) */}
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle Theme"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </button>

          {/* Authenticated State */}
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-[#8b5cf6] ring-offset-2 ring-offset-[#0a0a0a]">
                  <img 
                    src="https://i.pravatar.cc/150?u=a042581f4e29026024d" 
                    alt="User Avatar" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="hidden text-sm font-medium text-white sm:block">
                  Julfikar Rahman
                </span>
                <svg className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl border border-white/10 bg-[#121212] py-2 shadow-2xl">
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Dashboard</Link>
                  <Link href="/add-studio" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Add New Studio</Link>
                  <Link href="/my-listings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">My Studio Listings</Link>
                  <Link href="/my-bookings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">My Bookings</Link>
                  <div className="my-1 border-t border-white/10"></div>
                  <button 
                    onClick={() => setIsAuthenticated(false)}
                    className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 hover:text-red-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated State */
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7c3aed]">
                Register
              </Link>
            </div>
          )}

          
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="border-t border-white/5 md:hidden">
          <div className="space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white ${
                    isActive
                      ? "bg-white/5 text-white"
                      : "text-gray-400"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {!isAuthenticated && (
              <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-lg bg-[#8b5cf6] px-3 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#7c3aed]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}