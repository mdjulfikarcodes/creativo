"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarX2,
  Clock,
  Loader2,
  PlusCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import {
  fetchMyBookings,
  formatBookingDate,
  formatBookingTimeRange,
  formatPrice,
  type Booking,
  type BookingStatus,
} from "@/lib/booking";
import { getMyStudios } from "@/lib/studios";

type DashboardStats = {
  totalStudios: number;
  totalBookings: number;
  pending: number;
  revenue: number;
};

const EMPTY_STATS: DashboardStats = {
  totalStudios: 0,
  totalBookings: 0,
  pending: 0,
  revenue: 0,
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  Pending: "border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-300",
  Confirmed:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  Cancelled: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300",
};

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export default function DashboardOverviewPage() {
  const { data: session, isPending } = useSession();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const email = session?.user?.email ?? "";

  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (isPending || !email) return;

    const controller = new AbortController();
    let active = true;

    Promise.all([
      getMyStudios(email, controller.signal),
      fetchMyBookings(email, controller.signal),
    ])
      .then(([studios, bookings]) => {
        if (!active) return;

        const revenue = bookings
          .filter((booking) => booking.status === "Confirmed")
          .reduce((sum, booking) => sum + booking.totalPrice, 0);

        setStats({
          totalStudios: studios.length,
          totalBookings: bookings.length,
          pending: bookings.filter((booking) => booking.status === "Pending")
            .length,
          revenue,
        });
        setRecentBookings(bookings.slice(0, 3));
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your dashboard data.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [email, isPending, reloadKey]);

  const refresh = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  const userName = session?.user?.name?.split(" ")[0] || "Creator";
  const signInError =
    !isPending && !email ? "Please sign in to see your dashboard." : null;
  const displayError = error ?? signInError;

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
      value: `${formatPrice(stats.revenue)} SAR`,
      icon: TrendingUp,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
  ];

  const showLoading = isPending || (loading && Boolean(email));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* হেডার সেকশন */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${isDark ? "border-white/5" : "border-gray-200"}`}
      >
        <div>
          <h1
            className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {isPending ? "Welcome back!" : `Welcome back, ${userName}!`}
          </h1>
          <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Here&apos;s what&apos;s happening with your studios and bookings
            today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={refresh}
            disabled={showLoading || !email}
            className={`${isDark ? "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Link href="/dashboard/add-studio">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Studio
            </Button>
          </Link>
        </div>
      </div>

      {displayError && !showLoading && (
        <div className="flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{displayError}</p>
          </div>
          {email && (
            <Button
              type="button"
              variant="outline"
              onClick={refresh}
              className="h-9 border-rose-500/30 bg-transparent text-rose-600 hover:bg-rose-500/15 dark:text-rose-200 dark:hover:text-white"
            >
              Try again
            </Button>
          )}
        </div>
      )}

      {/* স্ট্যাটস কার্ডস */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className={`rounded-2xl p-6 transition-colors border ${
              isDark
                ? "bg-[#121212] border-white/5 hover:border-violet-500/30"
                : "bg-white border-gray-200 hover:border-violet-500/50 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <p
                className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {stat.title}
              </p>
              {showLoading ? (
                <div
                  className={`mt-2 h-7 w-20 animate-pulse rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`}
                />
              ) : (
                <h3
                  className={`text-2xl font-bold mt-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {stat.value}
                </h3>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* রিসেন্ট অ্যাক্টিভিটি */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`rounded-2xl p-6 border ${isDark ? "bg-[#121212] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Recent Bookings
            </h2>
            <Link
              href="/dashboard/my-bookings"
              className="text-sm text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {showLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-16 animate-pulse rounded-lg ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                />
              ))}
            </div>
          )}

          {!showLoading && recentBookings.length > 0 && (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-colors border border-transparent ${
                    isDark
                      ? "hover:bg-white/5 hover:border-white/5"
                      : "hover:bg-gray-50 hover:border-gray-100"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-600"}`}
                    >
                      {booking.studioName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {booking.studioName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatBookingDate(booking.date)} •{" "}
                        {formatBookingTimeRange(booking)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          )}

          {!showLoading && !displayError && recentBookings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-100 text-violet-600"}`}
              >
                <CalendarX2 className="h-6 w-6" />
              </div>
              <p
                className={`mt-3 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                No bookings yet.
              </p>
            </div>
          )}
        </div>

        <div
          className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center border ${
            isDark
              ? "bg-[#121212] border-white/5"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-100 text-violet-600"}`}
          >
            <Building2 className="w-8 h-8" />
          </div>
          <h3
            className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Grow your studio business
          </h3>
          <p
            className={`text-sm mt-2 max-w-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            List more spaces, manage bookings easily, and track your revenue all
            in one place.
          </p>
          <Link href="/dashboard/my-studio">
            <Button
              variant="outline"
              className={`${
                isDark
                  ? "border-white/10 text-white hover:bg-white/5"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Manage My Studios
            </Button>
          </Link>
        </div>
      </div>

      {showLoading && !isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Syncing your latest data…
        </div>
      )}
    </div>
  );
}
