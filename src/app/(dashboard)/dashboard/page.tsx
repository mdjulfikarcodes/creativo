"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Building2,
  CalendarCheck,
  Clock,
  DollarSign,
  RefreshCw,
  Star,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession, authClient } from "@/lib/auth-client";
import { fetchDashboardOverview, type DashboardStats } from "./api";

type BookingStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";

type Booking = {
  id: string;
  studioId?: string;
  studioName: string;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  review?: { rating: number; comment: string };
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

function normalizeStatus(value: unknown): BookingStatus {
  const status = String(value ?? "").toLowerCase();
  if (status.includes("cancel") || status.includes("declin") || status.includes("reject")) return "Cancelled";
  if (status.includes("confirm") || status.includes("approve") || status.includes("accept")) return "Confirmed";
  if (status.includes("complete")) return "Completed";
  return "Pending";
}

function normalizeBooking(raw: unknown): Booking | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const studio = record.studioId && typeof record.studioId === "object" ? (record.studioId as Record<string, unknown>) : record.studio && typeof record.studio === "object" ? (record.studio as Record<string, unknown>) : {};
  const id = String(record._id ?? record.id ?? record.bookingId ?? "");
  if (!id) return null;

  return {
    id,
    studioId: String((studio as Record<string, unknown>)._id ?? (studio as Record<string, unknown>).id ?? record.studioId ?? ""),
    studioName: String(studio.title ?? record.studioName ?? record.studioTitle ?? record.title ?? "Studio Booking"),
    image: String(studio.imageUrl ?? studio.image ?? record.studioImage ?? record.imageUrl ?? record.image ?? ""),
    date: String(record.date ?? record.bookingDate ?? record.startDate ?? ""),
    startTime: String(record.startTime ?? record.start ?? ""),
    endTime: String(record.endTime ?? record.end ?? ""),
    totalPrice: Number(record.totalPrice ?? record.totalRental ?? record.total ?? record.price ?? 0) || 0,
    status: normalizeStatus(record.status),
  };
}

function extractBookings(payload: unknown): Booking[] {
  let list: unknown[] = [];
  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.bookings)) list = record.bookings;
    else if (Array.isArray(record.data)) list = record.data;
  }
  return list.map(normalizeBooking).filter((booking): booking is Booking => booking !== null);
}

async function fetchMyBookings(token?: string): Promise<Booking[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
  if (!baseUrl) return [];
  try {
    const headers: HeadersInit = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}/booking/my-bookings`, { cache: "no-store", headers });
    if (!res.ok) return [];
    const data = await res.json();
    return extractBookings(data);
  } catch {
    return [];
  }
}

export default function DashboardOverviewPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data: session, isPending: sessionPending } = useSession();
  const email = session?.user?.email ?? "";

  const [token, setToken] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats>({ totalStudios: 0, totalBookings: 0, pendingApprovals: 0, totalRevenue: 0, totalReviews: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      if (email) {
        const { data } = await authClient.token();
        setToken(data?.token ?? "");
      }
    };
    getToken();
  }, [email]);

  const loadStats = useCallback(async () => {
    if (!token) return; 
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardOverview(token);
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load your dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadRecentBookings = useCallback(async () => {
    if (!token) return;
    try {
      const bookings = await fetchMyBookings(token);
      setRecentBookings(bookings.slice(0, 5));
    } catch {}
  }, [token]);

  useEffect(() => {
    if (sessionPending || !email || !token) return;

    const initialLoad = window.setTimeout(() => {
      loadStats();
      loadRecentBookings();
    }, 0);

    const onFocus = () => {
      loadStats();
      loadRecentBookings();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("focus", onFocus);
    };
  }, [email, sessionPending, token, loadStats, loadRecentBookings]);

  const refetch = useCallback(() => {
    loadStats();
    loadRecentBookings();
  }, [loadStats, loadRecentBookings]);

  const signInError = !sessionPending && !email ? "Please sign in to see your dashboard." : null;
  const displayError = error ?? signInError;
  const showLoading = sessionPending || (Boolean(email) && (!token || loading));

  const statCards = [
    { title: "Total Studios", value: stats.totalStudios.toString(), icon: Building2, color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/10" },
    { title: "Total Bookings", value: stats.totalBookings.toString(), icon: CalendarCheck, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "Pending Approvals", value: stats.pendingApprovals.toString(), icon: Clock, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10" },
    { title: "Total Revenue", value: `${formatPrice(stats.totalRevenue)} BDT`, icon: TrendingUp, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
    { title: "Total Reviews", value: stats.totalReviews.toString(), icon: Star, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10" },
  ];

  const cardClass = `rounded-2xl p-4 md:p-6 border transition-all ${isDark ? "bg-[#121212] border-white/5 shadow-sm" : "bg-white border-gray-200 shadow-sm"}`;

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
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center max-w-sm w-full">
          <p className="text-rose-600 dark:text-rose-300 text-sm mb-4">{displayError}</p>
          <Button type="button" onClick={refetch} className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 mb-8 ${isDark ? "border-white/5" : "border-gray-200"}`}>
          <div className="text-center sm:text-left">
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Hello {session?.user?.name || "User"}
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Here&apos;s what&apos;s happening with your studios and bookings today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button type="button" onClick={refetch} className="w-full sm:w-auto h-10 border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10">
              <RefreshCw className={`h-4 w-4 mr-2`} /> Refresh
            </Button>
            <Link href="/dashboard/add-studio" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white">Add New Studio</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.title} className={cardClass}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className={`text-[11px] sm:text-sm font-medium truncate ${isDark ? "text-gray-400" : "text-gray-600"}`}>{card.title}</p>
                  <p className="text-lg sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white truncate">{card.value}</p>
                </div>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center ml-2 ${card.bg} ${card.color}`}>
                  <card.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
            <Link href="/dashboard/my-bookings" className="text-xs sm:text-sm text-violet-500 dark:text-violet-400 hover:underline flex items-center gap-1">
              View All
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition-colors hover:border-violet-500/50 ${isDark ? "border-white/5 bg-[#121212]/50" : "border-gray-100 bg-white"}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold bg-violet-100 text-violet-600`}>
                      {booking.studioName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-medium text-gray-900 dark:text-white`}>{booking.studioName}</p>
                      <p className="text-xs text-gray-500">{booking.date}</p>
                    </div>
                  </div>
                  <span className={`self-start sm:self-auto text-[10px] sm:text-xs font-medium px-2 py-1 rounded ${booking.status === "Confirmed" ? "bg-emerald-100 text-emerald-600" : booking.status === "Pending" ? "bg-amber-100 text-amber-600" : booking.status === "Cancelled" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
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