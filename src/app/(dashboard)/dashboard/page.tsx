"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Building2, CalendarCheck, Clock, DollarSign, Star, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchMyBookings, formatPrice, type Booking } from "@/lib/booking";
import { getMyStudios } from "@/lib/studios";
import type { Studio } from "@/lib/types";
import { useSession } from "@/lib/auth-client";

type DashboardStats = {
  totalStudios: number;
  totalBookings: number;
  pending: number;
  revenue: number;
  totalReviews: number;
};

export default function DashboardOverviewPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data: session, isPending: sessionPending } = useSession();
  const email = session?.user?.email ?? "";

  const [stats, setStats] = useState<DashboardStats>({
    totalStudios: 0,
    totalBookings: 0,
    pending: 0,
    revenue: 0,
    totalReviews: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionPending || !email) {
      return;
    }

    let isMounted = true;

    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch studios and bookings independently so one failure doesn't block the other.
        const studiosPromise = getMyStudios(email).catch(() => [] as Studio[]);
        const bookingsPromise = fetchMyBookings().catch(() => [] as Booking[]);

        const [studios, bookings] = await Promise.all([studiosPromise, bookingsPromise]);

        if (!isMounted) return;

        const revenue = bookings
          .filter(
            (booking: Booking) =>
              booking.status === "Confirmed" ||
              booking.status === "Completed",
          )
          .reduce((sum: number, booking: Booking) => sum + booking.totalPrice, 0);

        const totalReviews = studios.reduce(
          (acc: number, studio: Studio) => acc + (studio.reviewList?.length ?? 0),
          0,
        );

        setStats({
          totalStudios: studios.length,
          totalBookings: bookings.length,
          pending: bookings.filter((b: Booking) => b.status === "Pending").length,
          revenue,
          totalReviews,
        });
        setRecentBookings(bookings.slice(0, 5));
      } catch (err: unknown) {
        if (!isMounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your dashboard data.",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [email, sessionPending]);

  const userName = session?.user?.name?.split(" ")[0] || "Creator";
  const signInError =
    !sessionPending && !email ? "Please sign in to see your dashboard." : null;
  const displayError = error ?? signInError;
  const showLoading = sessionPending || (Boolean(email) && loading);

  const statCards = [
    {
      title: "Total Studios",
      value: stats.totalStudios.toString(),
      icon: Building2,
      color: "text-violet-500 dark:text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      icon: CalendarCheck,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Pending Approvals",
      value: stats.pending.toString(),
      icon: Clock,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Total Revenue",
      value: `${formatPrice(stats.revenue)} BDT`,
      icon: TrendingUp,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Reviews",
      value: stats.totalReviews.toString(),
      icon: Star,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  const cardClass = `rounded-2xl p-6 border transition-all ${isDark ? "bg-[#121212] border-white/5 shadow-sm" : "bg-white border-gray-200 shadow-sm"}`;

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <DollarSign className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <p className="text-rose-600 dark:text-rose-300 text-sm">{displayError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">

        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 mb-8 ${isDark ? "border-white/5" : "border-gray-200"}`}>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Hello {session?.user?.name || "User"}
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Here&apos;s what&apos;s happening with your studios and bookings today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/add-studio">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                <span>Add New Studio</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.title} className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Bookings
            </h2>
            <Link
              href="/dashboard/my-bookings"
              className="text-sm text-violet-500 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              View All
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                No bookings yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors hover:border-violet-500/50 ${isDark ? "border-white/5 bg-[#121212]/50" : "border-gray-100 bg-white"}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold bg-violet-100 text-violet-600`}>
                      {booking.studioName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-medium text-gray-900 dark:text-white`}>
                        {booking.studioName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.date}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    booking.status === "Confirmed"
                      ? "bg-emerald-100 text-emerald-600"
                      : booking.status === "Pending"
                        ? "bg-amber-100 text-amber-600"
                        : booking.status === "Cancelled"
                          ? "bg-rose-100 text-rose-600"
                          : "bg-emerald-100 text-emerald-600"
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}