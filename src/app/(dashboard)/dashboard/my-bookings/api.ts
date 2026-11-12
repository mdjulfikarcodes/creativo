"use client";

import { authClient } from "@/lib/auth-client";

export type BookingStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";

export interface Booking {
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
}

export interface ApiError extends Error {
  status?: number;
}

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? "").replace(/\/+$/, "");
}

async function getAuthToken(): Promise<string | null> {
  try {
    const { data } = await authClient.token();
    return data?.token ?? null;
  } catch {
    return null;
  }
}

function normalizeStatus(value: unknown): BookingStatus {
  const status = String(value ?? "").toLowerCase();
  if (
    status.includes("cancel") ||
    status.includes("declin") ||
    status.includes("reject")
  ) {
    return "Cancelled";
  }
  if (
    status.includes("confirm") ||
    status.includes("approve") ||
    status.includes("accept")
  ) {
    return "Confirmed";
  }
  if (status.includes("complete")) {
    return "Completed";
  }
  return "Pending";
}

function normalizeBooking(raw: unknown): Booking | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;

  const studio =
    record.studioId && typeof record.studioId === "object"
      ? (record.studioId as Record<string, unknown>)
      : record.studio && typeof record.studio === "object"
        ? (record.studio as Record<string, unknown>)
        : {};

  const id = String(record._id ?? record.id ?? record.bookingId ?? "");
  if (!id) return null;


  const timeRange = String(record.time ?? "");
  let startTime = String(record.startTime ?? record.start ?? "");
  let endTime = String(record.endTime ?? record.end ?? "");
  if ((!startTime || !endTime) && timeRange.includes("-")) {
    const [rangeStart, rangeEnd] = timeRange.split("-").map((part) => part.trim());
    startTime = startTime || rangeStart;
    endTime = endTime || rangeEnd;
  }

  const studioId =
    record.studioId && typeof record.studioId === "object"
      ? String(
        (record.studioId as Record<string, unknown>)._id ??
        (record.studioId as Record<string, unknown>).id
      )
      : String(record.studioId ?? studio._id ?? studio.id);

  return {
    id,
    studioId: studioId || undefined,
    studioName: String(
      studio.title ??
      record.studioName ??
      record.studioTitle ??
      record.title ??
      "Studio Booking"
    ),
    image: String(
      studio.imageUrl ??
      studio.image ??
      record.studioImage ??
      record.imageUrl ??
      record.image ??
      ""
    ),
    date: String(record.date ?? record.bookingDate ?? record.startDate ?? ""),
    startTime,
    endTime,
    totalPrice:
      Number(
        record.totalPrice ??
        record.totalRental ??
        record.total ??
        record.price ??
        0
      ) || 0,
    status: normalizeStatus(record.status),
  };
}


function extractBookings(payload: unknown): Booking[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeBooking).filter((b): b is Booking => b !== null);
  }
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  let list: unknown[] = [];
  if (Array.isArray(record.bookings)) {
    list = record.bookings;
  } else if (Array.isArray(record.data)) {
    list = record.data;
  } else if (
    record.data &&
    typeof record.data === "object" &&
    Array.isArray((record.data as Record<string, unknown>).bookings)
  ) {
    list = (record.data as Record<string, unknown>).bookings as unknown[];
  }
  return list.map(normalizeBooking).filter((b): b is Booking => b !== null);
}


export async function fetchMyBookings({
  signal,
}: {
  signal?: AbortSignal;
} = {}): Promise<Booking[]> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    const error = new Error(
      "Booking API is not configured. Set NEXT_PUBLIC_SERVER_BASE_URL."
    ) as ApiError;
    error.status = 500;
    throw error;
  }

  const token = await getAuthToken();
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}/booking/my-bookings`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers,
    signal,
  });

  if (res.status === 401 || res.status === 403) {
    const error = new Error("Unauthorized") as ApiError;
    error.status = res.status;
    throw error;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      typeof body?.message === "string"
        ? body.message
        : `Failed to load bookings (${res.status}).`;
    const error = new Error(message) as ApiError;
    error.status = res.status;
    throw error;
  }

  const payload = await res.json();
  return extractBookings(payload);
}
