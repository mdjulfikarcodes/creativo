const FALLBACK_STUDIO_IMAGE =
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop";

export type BookingStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";

export type Booking = {
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

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? "").replace(/\/+$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return "";
  return String(value);
}

function asNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(asString(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeBookingStatus(value: unknown): BookingStatus {
  const status = asString(value).toLowerCase();

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

function extractBookings(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  if (Array.isArray(payload.bookings)) return payload.bookings;
  if (Array.isArray(payload.data)) return payload.data;

  if (isRecord(payload.data) && Array.isArray(payload.data.bookings)) {
    return payload.data.bookings;
  }

  return [];
}

function normalizeBooking(raw: unknown): Booking | null {
  if (!isRecord(raw)) return null;

  const studio = isRecord(raw.studioId)
    ? raw.studioId
    : isRecord(raw.studio)
      ? raw.studio
      : {};

  const id = asString(raw._id ?? raw.id ?? raw.bookingId);
  if (!id) return null;

  const timeRange = asString(raw.time);
  let startTime = asString(raw.startTime ?? raw.start);
  let endTime = asString(raw.endTime ?? raw.end);

  if ((!startTime || !endTime) && timeRange.includes("-")) {
    const [rangeStart, rangeEnd] = timeRange
      .split("-")
      .map((part) => part.trim());
    startTime = startTime || rangeStart;
    endTime = endTime || rangeEnd;
  }

  const studioId = isRecord(raw.studioId)
    ? asString(raw.studioId._id ?? raw.studioId.id)
    : asString(raw.studioId ?? studio._id ?? studio.id);

  return {
    id,
    studioId: studioId || undefined,
    studioName:
      asString(studio.title ?? raw.studioName ?? raw.studioTitle ?? raw.title) ||
      "Studio Booking",
    image:
      asString(
        studio.imageUrl ??
          studio.image ??
          raw.studioImage ??
          raw.imageUrl ??
          raw.image,
      ) || FALLBACK_STUDIO_IMAGE,
    date: asString(raw.date ?? raw.bookingDate ?? raw.startDate),
    startTime,
    endTime,
    totalPrice: asNumber(
      raw.totalPrice ?? raw.totalRental ?? raw.total ?? raw.price,
    ),
    status: normalizeBookingStatus(raw.status),
  };
}

export function formatBookingDate(value: unknown): string {
  const raw = asString(value);
  if (!raw) return "Date not specified";

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(raw);

  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatBookingTime(value: unknown): string {
  const raw = asString(value);
  if (!raw) return "";

  const clock = /^(\d{1,2}):(\d{2})/.exec(raw);
  if (clock) {
    const hour = Number(clock[1]);
    const minute = clock[2];
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute} ${suffix}`;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatBookingTimeRange(
  booking: Pick<Booking, "startTime" | "endTime">,
): string {
  const start = formatBookingTime(booking.startTime);
  const end = formatBookingTime(booking.endTime);

  if (start && end) return `${start} – ${end}`;
  return start || end || "Time not specified";
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculateHours(startTime: string, endTime: string): number {
  const toMinutes = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return Number.NaN;
    return hours * 60 + minutes;
  };

  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return (end - start) / 60;
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "Booking API is not configured. Set NEXT_PUBLIC_SERVER_BASE_URL in .env.local.",
    );
  }

  const response = await fetch(`${baseUrl}/booking/my-bookings`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Please sign in to view your bookings.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body?.message === "string"
        ? body.message
        : `Failed to load bookings (${response.status}).`;
    throw new Error(message);
  }

  const payload = await response.json();
  const bookings = extractBookings(payload);

  return bookings
    .map(normalizeBooking)
    .filter((booking): booking is Booking => booking !== null);
}
