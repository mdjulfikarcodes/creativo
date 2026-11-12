"use client";
export interface DashboardStats {
  totalStudios: number;
  totalBookings: number;
  pendingApprovals: number;
  totalRevenue: number;
  totalReviews: number;
}

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? "").replace(/\/+$/, "");
}

export async function fetchDashboardOverview(token?: string): Promise<DashboardStats> {
  const baseUrl = getApiBaseUrl();

  const headers: HeadersInit = { Accept: "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}/dashboard/overview`, {
    method: "GET",
    cache: "no-store",
    headers: headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to load dashboard overview (${res.status})`);
  }
  const payload = await res.json();
  return payload?.data ?? payload;
}

export const instant = false;