"use client";

import { useState, useSyncExternalStore, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Heart, Sun, Moon } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";

const emptySubscribe = () => () => {};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const { data: session, isPending } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [imgError, setImgError] = useState(false);

  const userName = session?.user?.name ?? "Account";
  const userEmail = session?.user?.email ?? "";
  const userImage = session?.user?.image;
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const currentHash = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("hashchange", onStoreChange);
      return () => window.removeEventListener("hashchange", onStoreChange);
    },
    () => window.location.hash,
    () => ""
  );

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Studios", href: "/studios" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "About Us", href: "/#about" },
  ];

  const checkIsActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" && (currentHash === "" || currentHash === "#");
    }
    
    if (href.includes("#")) {
      const targetHash = href.split("#")[1];
      return pathname === "/" && currentHash === `#${targetHash}`;
    }

    return pathname.startsWith(href);
  };

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      
      if (pathname === "/") {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", href);
          window.dispatchEvent(new Event("hashchange"));
        }
      } else {
        router.push(href);
        setTimeout(() => {
          window.dispatchEvent(new Event("hashchange"));
        }, 100);
      }
      setIsMobileMenuOpen(false);
    } else {
      setIsMobileMenuOpen(false);
      window.setTimeout(() => {
        window.dispatchEvent(new Event("hashchange"));
      }, 100);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md transition-colors duration-200 dark:border-white/5 dark:bg-[#0a0a0a]/95">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Mobile: Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => {
              window.setTimeout(() => {
                window.dispatchEvent(new Event("hashchange"));
              }, 100);
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6] shadow-md shadow-purple-500/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Creativo<span className="text-[#8b5cf6]">.</span>
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = checkIsActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative text-sm font-medium transition-colors ${
                  isActive
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-[#8b5cf6]"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions (Theme Toggle + Auth) */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Theme Toggle Button */}
          <button 
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Toggle Theme"
            title={mounted ? (resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode") : "Toggle Theme"}
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-yellow-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-gray-700 transition-transform hover:-rotate-12" />
              )
            ) : (
              <div className="h-4.5 w-4.5" />
            )}
          </button>

          {isAuthenticated && (
            <Link
              href="/wishlist"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
              aria-label="Wishlist"
            >
              <Heart className="h-4.5 w-4.5" />
            </Link>
          )}

          {/* Authenticated State */}
          {isPending ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-white/10" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-[#8b5cf6] ring-offset-2 ring-offset-white dark:ring-offset-[#0a0a0a]">
                  {userImage && !imgError ? (
                    <Image
                      src={userImage}
                      alt={userName}
                      width={36}
                      height={36}
                      sizes="36px"
                      className="h-full w-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&background=8b5cf6&color=fff`}
                      alt={userName}
                      width={36}
                      height={36}
                      sizes="36px"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <span className="hidden text-sm font-medium text-gray-900 dark:text-white sm:block">
                  {userName}
                </span>
                <svg className={`h-4 w-4 text-gray-500 transition-transform dark:text-gray-400 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 👇 Dropdown Menu (ড্যাশবোর্ডের লিংকসহ) */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-2xl dark:border-white/10 dark:bg-[#121212]">
                  
                  {/* ইউজারের নাম ও ইমেইল */}
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5 mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {userEmail}
                    </p>
                  </div>

                  {/* লিংকগুলো */}
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white">
                    Overview
                  </Link>
                  <Link href="/dashboard/add-studio" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white">
                    Add New Studio
                  </Link>
                  <Link href="/dashboard/my-studio" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white">
                    My Studio Listings
                  </Link>
                  <Link href="/dashboard/my-bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white">
                    My Bookings
                  </Link>
                  
                  <div className="my-1 border-t border-gray-200 dark:border-white/10"></div>
                  
                  <button 
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-white/5 dark:hover:text-red-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated State */
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/login" className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
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
        <div id="mobile-menu" className="border-t border-gray-200 bg-white md:hidden dark:border-white/5 dark:bg-[#0a0a0a]">
          <div className="space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => {
              const isActive = checkIsActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900 dark:bg-white/5 dark:text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {!isAuthenticated && (
              <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-3 dark:border-white/10">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
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