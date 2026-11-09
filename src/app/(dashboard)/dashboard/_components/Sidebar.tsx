"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft, CalendarCheck, Camera, PlusCircle, LayoutDashboard } from "lucide-react";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Add Studio", href: "/dashboard/add-studio", icon: PlusCircle },
  { name: "My Bookings", href: "/dashboard/my-bookings", icon: CalendarCheck },
  { name: "My Studio", href: "/dashboard/my-studio", icon: Camera },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-border bg-background px-4">
      
      <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Dashboard
      </p>

      <nav className="mt-3 flex flex-col gap-1">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              {name}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Home
      </Link>
    </aside>
  );
};

export default Sidebar;