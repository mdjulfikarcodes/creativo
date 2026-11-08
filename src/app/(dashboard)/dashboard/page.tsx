"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarX2,
  Clock,
  DollarSign,
  Loader2,
  PlusCircle,
  RefreshCw,
  Star,
  TrendingUp,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getBearerToken, useSession } from "@/lib/auth-client";
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
  totalReviews: number;
};

const EMPTY_STATS: DashboardStats = {
  totalStudios: 0,
  totalBookings: 0,
  pending: 0,
  revenue: 0,
  totalReviews: 0,
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  Pending: "border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-300",
  Confirmed:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  Cancelled: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  Completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
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
  const [recentReviews, setRecentReviews] = useState<{
    user: string;
    rating: number;
    comment: string;
    studioName: string;
  }[]>([]);
  const [chartData, setChartData] = useState<{ month: string; revenue: number }[]>(
    [],
  );
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>(
    [],
  );
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>(
    [],
  );
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
      (async () => {
        const baseUrl = (process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? "").replace(
          /\/+$/,
          "",
        );
        const token = await getBearerToken();
        if (!baseUrl || !token) return [];
        const res = await fetch(`${baseUrl}/wishlist`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return [];
        return await res.json();
      })(),
    ])
      .then(([studios, bookings, wishlist]) => {
        if (!active) return;

        const revenue = bookings
          .filter(
            (booking) =>
              booking.status === "Confirmed" ||
              booking.status === "Completed",
          )
          .reduce((sum, booking) => sum + booking.totalPrice, 0);

        const totalReviews = studios.reduce(
          (acc, studio) => acc + (studio.reviewList?.length ?? 0),
          0,
        );

        const allReviews = studios.flatMap((studio) =>
          (studio.reviewList ?? []).map((rev) => ({
            user: rev.user,
            rating: rev.rating,
            comment: rev.comment,
            studioName: studio.title || "Studio",
          })),
        );
        setRecentReviews(allReviews.slice(0, 3));

        const monthlyMap = new Map<string, number>();
        bookings
          .filter(
            (booking) =>
              booking.status === "Confirmed" ||
              booking.status === "Completed",
          )
          .forEach((booking) => {
            const date = new Date(booking.date);
            if (isNaN(date.getTime())) return;
            const month = date.toLocaleDateString("en-US", {
              month: "short",
            });
            monthlyMap.set(
              month,
              (monthlyMap.get(month) ?? 0) + booking.totalPrice,
            );
          });

        const sortedMonths = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const chartData = sortedMonths
          .filter((m) => monthlyMap.has(m))
          .map((m) => ({ month: m, revenue: monthlyMap.get(m) ?? 0 }));

        setChartData(chartData);

        const categoryMap = new Map<string, number>();
        studios.forEach((studio) => {
          const cat = studio.category || "Uncategorized";
          categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
        });
        const categoryDataList = Array.from(categoryMap.entries()).map(
          ([name, value]) => ({ name, value }),
        );
        setCategoryData(categoryDataList);

        const totalBookingsCount = bookings.length;
        const statusMap: Record<string, number> = {
          Pending: bookings.filter((b) => b.status === "Pending").length,
          Confirmed: bookings.filter((b) => b.status === "Confirmed").length,
          Completed: bookings.filter((b) => b.status === "Completed").length,
          Cancelled: bookings.filter((b) => b.status === "Cancelled").length,
        };
        const statusData = [
          { name: "Pending", value: statusMap.Pending, color: "#f59e0b" },
          { name: "Confirmed", value: statusMap.Confirmed, color: "#10b981" },
          { name: "Completed", value: statusMap.Completed, color: "#3b82f6" },
          { name: "Cancelled", value: statusMap.Cancelled, color: "#ef4444" },
        ];
        setStatusData(statusData);

        setStats({
          totalStudios: studios.length,
          totalBookings: bookings.length,
          pending: bookings.filter(
            (booking) => booking.status === "Pending",
          ).length,
          revenue,
          totalReviews,
        });
        setRecentBookings(bookings.slice(0, 5));
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

  const showLoading = isPending || (loading && Boolean(email));

  const cardClass = `rounded-2xl p-6 border transition-all ${isDark ? "bg-[#121212] border-white/5 shadow-sm" : "bg-white border-gray-200 shadow-sm"}`;
  const glassCardClass = `rounded-2xl p-6 backdrop-blur-md bg-white/10 border border-white/20 ${isDark ? "dark:bg-[#121212] dark:border-white/10" : ""}`;
  const headerCardClass = `flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 mb-8 ${isDark ? "border-white/5" : "border-gray-200"}`;
  const greetingClass = `text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`;
  const subtextClass = `text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`;
  const h2Class = `text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`;
  const textMutedClass = `text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`;
  const textSecondaryClass = `text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`;
  const textPrimaryClass = `text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 12 },
    },
    hover: { scale: 1.02 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6 min-h-screen bg-gray-50 dark:bg-[#0a0a0a]"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        whileHover={itemVariants.hover}
        className={headerCardClass}
      >
        <div>
          <h1 className={greetingClass}>Hello {session?.user?.name || "User"}</h1>
          <p className={subtextClass}>
            Here&apos;s what&apos;s happening with your studios and bookings today.
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
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/dashboard/add-studio">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Studio
            </Button>
          </Link>
        </div>
      </motion.div>

      {displayError && !showLoading && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between"
        >
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
        </motion.div>
      )}

      {/* Row 1: Revenue Card + Booking Trends */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        {/* Revenue Card - AreaChart */}
        <motion.div
          variants={itemVariants}
          whileHover={itemVariants.hover}
          className={`rounded-2xl p-6 backdrop-blur-md bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 ${isDark ? "dark:bg-[#121212] dark:border-white/10" : ""}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={h2Class}>Revenue Overview</h2>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-extrabold text-rose-500">
              {stats.revenue}
            </span>
            <span className="text-sm font-medium text-green-500">
              ▲ 12% from last month
            </span>
          </div>
          {showLoading || chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className={`h-12 w-12 mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              <p className={textMutedClass}>No booking data available yet</p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorViolet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        return (
                          <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/20 dark:bg-[#121212] dark:border-white/10">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                              {payload[0].payload.month}
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatPrice(payload[0].payload.revenue)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="natural"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViolet)"
                    dot={{ fill: "#8b5cf6" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Booking Trends - Multi-line LineChart */}
        <motion.div
          variants={itemVariants}
          whileHover={itemVariants.hover}
          className={`rounded-2xl p-6 backdrop-blur-md bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 ${isDark ? "dark:bg-[#121212] dark:border-white/10" : ""}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={h2Class}>Booking Trends</h2>
          </div>
          {showLoading || chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarCheck className={`h-12 w-12 mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              <p className={textMutedClass}>No booking data available yet</p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        return (
                          <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/20 dark:bg-[#121212] dark:border-white/10">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                              {payload[0].payload.month}
                            </p>
                            {payload.map((entry, index) => (
                              <div key={index} className="flex items-center gap-2 mb-1">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                  {entry.payload.name}
                                </span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white ml-auto">
                                  {formatPrice(entry.payload.revenue)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line
                    type="natural"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6" }}
                  />
                  <Line
                    type="natural"
                    dataKey="revenue"
                    name="Bookings"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Row 2: Category Distribution + Big Number */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        {/* Category Distribution - BarChart */}
        <motion.div
          variants={itemVariants}
          whileHover={itemVariants.hover}
          className={`rounded-2xl p-6 backdrop-blur-md bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 ${isDark ? "dark:bg-[#121212] dark:border-white/10" : ""}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={h2Class}>Category Distribution</h2>
          </div>
          {showLoading || categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className={`h-12 w-12 mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              <p className={textMutedClass}>No category data available yet</p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Big Number - Mini Waveform */}
        <motion.div
          variants={itemVariants}
          whileHover={itemVariants.hover}
          className={`rounded-2xl p-6 backdrop-blur-md bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 ${isDark ? "dark:bg-[#121212] dark:border-white/10" : ""}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-4xl font-extrabold">
                {stats.totalBookings}
              </span>
              <p className={textMutedClass}>Total Bookings</p>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-1 h-6 rounded-full bg-violet-500/20" />
              ))}
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* Row 3: Recent Bookings + Progress Bars + Radial Chart */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Bookings */}
        <motion.div
          variants={itemVariants}
          whileHover={itemVariants.hover}
          className={`rounded-2xl p-6 backdrop-blur-md bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 ${isDark ? "dark:bg-[#121212] dark:border-white/10" : ""}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={h2Class}>Recent Bookings</h2>
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
                <div key={index} className={`h-16 animate-pulse rounded-lg ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
              ))}
            </div>
          )}

          {!showLoading && recentBookings.length > 0 && (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors hover:border-violet-500/50 ${isDark ? "border-white/5 bg-[#121212]/50 dark:hover:border-violet-500/50 dark:hover:bg-[#121212]/80" : "border-gray-100 bg-white hover:border-violet-500/50 hover:shadow-lg"}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-600"}`}>
                      {booking.studioName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
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
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-100 text-violet-600"}`}>
                <CalendarX2 className="h-6 w-6" />
              </div>
              <p className={textMutedClass}>No bookings yet.</p>
            </div>
          )}
        </motion.div>

        {/* Progress Bars */}
        <motion.div
          variants={itemVariants}
          whileHover={itemVariants.hover}
          className={`rounded-2xl p-6 backdrop-blur-md bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 ${isDark ? "dark:bg-[#121212] dark:border-white/10" : ""}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={h2Class}>Booking Status</h2>
          </div>
          <div className="space-y-4">
            {statusData.map((s) => {
              const pct = stats.totalBookings > 0 ? Math.round((s.value / stats.totalBookings) * 100) : 0;
              return (
                <div key={s.name} className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className={textSecondaryClass}>{s.name}</span>
                    <span className={textSecondaryClass}>{s.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: s.color, width: `${pct}%` }}
                    />
                  </div>
                  <div className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Radial Chart */}
        <motion.div
          variants={itemVariants}
          whileHover={itemVariants.hover}
          className={`rounded-2xl p-6 backdrop-blur-md bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 ${isDark ? "dark:bg-[#121212] dark:border-white/10" : ""}`}
        >
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className="text-4xl font-extrabold"
                  style={{ color: isDark ? "white" : "black" }}
                >
                  {stats.totalStudios}
                </motion.span>
                <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  Total Studios
                </span>
              </div>
              <svg className="w-32 h-32" viewBox="0 0 42 42">
                <circle
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="transparent"
                  stroke={isDark ? "white/10" : "gray-100"}
                  strokeWidth="3"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeDasharray="100"
                  strokeDashoffset={`${100 - Math.min(100, stats.totalStudios * 10)}`}
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
          </div>
          <p className={`mt-4 text-sm ${isDark ? "text-gray-400" : "text-gray-600"} text-center`}>
            Your studio listings
          </p>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
        className={`mt-8 rounded-2xl p-6 backdrop-blur-md bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 ${isDark ? "dark:bg-[#121212] dark:border-white/10" : ""}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={h2Class}>Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/add-studio">
            <Button className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white">
              <PlusCircle className="w-4 h-4" />
              Add Studio
            </Button>
          </Link>
          <Link href="/dashboard/my-bookings">
            <Button className="w-full flex items-center justify-center gap-2 border">
              <CalendarCheck className="w-4 h-4" />
              My Bookings
            </Button>
          </Link>
          <Link href="/studios">
            <Button className="w-full flex items-center justify-center gap-2 border">
              <ArrowRight className="w-4 h-4" />
              Explore Studios
            </Button>
          </Link>
        </div>
      </motion.div>

      {showLoading && !isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Syncing your latest data…
        </div>
      )}
    </motion.div>
  );
}
