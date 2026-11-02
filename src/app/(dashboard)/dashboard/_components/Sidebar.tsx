"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { ArrowLeft, CalendarCheck, Camera, PlusCircle } from "lucide-react";

const navItems = [
  { name: "Add Studio", href: "/dashboard/add-studio", icon: PlusCircle },
  { name: "My Bookings", href: "/dashboard/my-bookings", icon: CalendarCheck },
  { name: "My Studio", href: "/dashboard/my-studio", icon: Camera },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-white/5 bg-[#0a0a0a] px-4 py-6">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 px-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b5cf6]">
          <Camera className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Creativo<span className="text-[#8b5cf6]">.</span>
        </span>
      </Link>

      <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
        Dashboard
      </p>

      {/* Routes */}
      <nav className="mt-3 flex flex-col gap-1">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#8b5cf6]/15 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-[#8b5cf6]" : "text-gray-500"
                )}
              />
              {name}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <Link
        href="/"
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ArrowLeft className="h-5 w-5 text-gray-500" />
        Back to Home
      </Link>
    </aside>
  );
};

export default Sidebar;
