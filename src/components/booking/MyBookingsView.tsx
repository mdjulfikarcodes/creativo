"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CalendarX2,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { jsPDF } from "jspdf";

import { authClient } from "@/lib/auth-client";
import { fetchMyBookings, type Booking } from "@/app/(dashboard)/dashboard/my-bookings/api";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";



function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

function formatBookingDate(value: unknown): string {
  const raw = String(value ?? "");
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

function formatBookingTime(value: unknown): string {
  const raw = String(value ?? "");
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

function formatBookingTimeRange(booking: Pick<Booking, "startTime" | "endTime">): string {
  const start = formatBookingTime(booking.startTime);
  const end = formatBookingTime(booking.endTime);
  if (start && end) return `${start} – ${end}`;
  return start || end || "Time not specified";
}



const STATUS_STYLES: Record<Booking["status"], string> = {
  Pending: "border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-300",
  Confirmed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  Cancelled: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  Completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
};

function StatusBadge({ status }: { status: Booking["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/5 dark:bg-[#121212] sm:flex-row sm:items-center"
        >
          <Skeleton className="h-40 w-full rounded-xl bg-gray-200 dark:bg-white/5 sm:h-28 sm:w-40" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-1/2 bg-gray-200 dark:bg-white/5" />
            <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-white/5" />
            <Skeleton className="h-4 w-1/3 bg-gray-200 dark:bg-white/5" />
          </div>
          <Skeleton className="h-10 w-28 bg-gray-200 dark:bg-white/5" />
        </div>
      ))}
    </div>
  );
}

const STUDIO_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop";

function BookingStudioImage({ src, alt }: { src: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState(src || STUDIO_IMAGE_FALLBACK);
  
  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 640px) 100vw, 160px"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => setImageSrc(STUDIO_IMAGE_FALLBACK)}
    />
  );
}

async function authenticatedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const baseUrl = (process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? "").replace(/\/+$/, "");
  const { data } = await authClient.token();
  const token = data?.token ?? null;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${baseUrl}${input}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers,
  });
}

function downloadInvoice(booking: Booking) {
  try {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Creativo Booking Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Studio: ${booking.studioName}`, 20, 40);
    doc.text(`Date: ${formatBookingDate(booking.date)}`, 20, 52);
    doc.text(`Time: ${formatBookingTimeRange(booking)}`, 20, 64);
    doc.text(`Total: ${formatPrice(booking.totalPrice)} BDT`, 20, 76);
    doc.text(`Booking ID: ${booking.id}`, 20, 88);
    doc.text("Thank you for booking with Creativo.", 20, 104);
    doc.save(`invoice-${booking.id}.pdf`);
    toast.add({ type: "success", title: "Invoice downloaded" });
  } catch {
    toast.add({ type: "error", title: "Invoice failed" });
  }
}

function BookingActions({
  booking,
  onConfirm,
  onCancel,
  onReview,
  onInvoice,
}: {
  booking: Booking;
  onConfirm: () => void;
  onCancel: () => void;
  onReview: () => void;
  onInvoice: () => void;
}) {
  return (
    <div
      className="flex flex-col items-start gap-4 border-t border-gray-200 pt-4 dark:border-white/5 sm:items-end sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5"
    >
      <div className="sm:text-right">
        <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">
          Total Price
        </p>
        <p className="flex items-baseline gap-1 text-xl font-bold text-gray-900 dark:text-white sm:justify-end">
          {formatPrice(booking.totalPrice)}
          <span className="text-xs font-semibold text-violet-500 dark:text-violet-400">
            BDT
          </span>
        </p>
      </div>

      {booking.status === "Pending" && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            className="h-9 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <CheckCircle className="h-4 w-4 mr-1.5" />
            Confirm
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-9 border-gray-200 bg-white text-gray-700 hover:border-rose-500/40 hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
          >
            <XCircle className="h-4 w-4 mr-1.5" />
            Cancel
          </Button>
        </div>
      )}
      {booking.status === "Completed" && !booking.review && (
        <Button type="button" size="sm" onClick={onReview}>
          Leave a Review
        </Button>
      )}
      {booking.review && (
        <div className="text-sm">
          {[...Array(booking.review.rating)].map(() => "★").join(" ")}
          {booking.review.comment}
        </div>
      )}
      {booking.status === "Confirmed" && (
        <Button type="button" size="sm" onClick={onInvoice}>
          Download Invoice
        </Button>
      )}
    </div>
  );
}



export default function MyBookingsView() {
  const router = useRouter();


  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);


  const [confirmTarget, setConfirmTarget] = useState<Booking | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const [review, setReview] = useState({
    target: null as Booking | null,
    rating: 5,
    comment: "",
    isSubmitting: false,
  });



  const loadBookings = useCallback(
    async (signal?: AbortSignal) => {
      setError(null);
      try {
        setLoading(true);
        const data = await fetchMyBookings({ signal });
        setBookings(data);
      } catch (err) {

        if (err instanceof Error && err.name === "AbortError") return;

        const apiErr = err as { status?: number; message?: string };

        if (apiErr.status === 401 || apiErr.status === 403) {
          router.push("/login?redirect=/dashboard/my-bookings");
          return;
        }

        setError(apiErr.message ?? "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      await loadBookings(controller.signal);
    };
    
    fetchData();

    return () => controller.abort();
  }, [loadBookings]);

  const refreshBookings = useCallback(() => {
    loadBookings();
  }, [loadBookings]);

 

  async function handleConfirmBooking() {
    if (!confirmTarget) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      const res = await authenticatedFetch(
        `/booking/${encodeURIComponent(confirmTarget.id)}/confirm`,
        { method: "PATCH" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          typeof body?.message === "string"
            ? body.message
            : `Could not confirm this booking (${res.status}).`;
        throw new Error(message);
      }
      toast.add({
        type: "success",
        title: "Booking Confirmed",
        description: `${confirmTarget.studioName} is now confirmed.`,
      });
      setConfirmTarget(null);
      setConfirmError(null);
      await loadBookings();

      await router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while confirming this booking.";
      setConfirmError(message);
      toast.add({
        type: "error",
        title: "Confirmation failed",
        description: message,
      });
    } finally {
      setIsConfirming(false);
    }
  }

 

  async function handleCancelBooking() {
    if (!cancelTarget) return;
    const booking = cancelTarget;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const res = await authenticatedFetch(
        `/booking/${encodeURIComponent(booking.id)}/cancel`,
        { method: "PATCH" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          typeof body?.message === "string"
            ? body.message
            : `Could not cancel this booking (${res.status}).`;
        throw new Error(message);
      }
      toast.add({
        type: "success",
        title: "Booking cancelled",
        description: `${booking.studioName} on ${formatBookingDate(booking.date)} has been cancelled.`,
      });
      setCancelTarget(null);
      await loadBookings();
   
      await router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while cancelling this booking.";
      setCancelError(message);
      toast.add({
        type: "error",
        title: "Cancellation failed",
        description: message,
      });
    } finally {
      setIsCancelling(false);
    }
  }

  

  async function handleSubmitReview() {
    if (!review.target) return;
    const targetBooking = review.target;
    setReview((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const res = await authenticatedFetch(
        `/studio/${encodeURIComponent(targetBooking.studioId ?? "")}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: Number(review.rating),
            comment: review.comment,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to submit review");

      toast.add({
        type: "success",
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      setReview((prev) => ({
        ...prev,
        target: null,
        rating: 5,
        comment: "",
        isSubmitting: false,
      }));
      setBookings((prev) =>
        prev.map((b) =>
          b.id === targetBooking.id
            ? {
                ...b,
                review: {
                  rating: Number(review.rating),
                  comment: review.comment,
                },
              }
            : b
        )
      );
    } catch (err) {
      toast.add({
        type: "error",
        title: "Review failed",
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setReview((prev) => ({ ...prev, isSubmitting: false }));
    }
  }

  const closeCancelDialog = () => {
    if (isCancelling) return;
    setCancelTarget(null);
    setCancelError(null);
  };
  const closeConfirmDialog = () => {
    if (isConfirming) return;
    setConfirmTarget(null);
    setConfirmError(null);
  };
  const closeReviewDialog = () => {
    setReview((prev) => ({ ...prev, target: null }));
  };

  const showSkeleton = loading && bookings.length === 0;
  const showEmpty = !loading && !error && bookings.length === 0;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 text-gray-900 dark:text-white">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-white/5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              My Bookings
            </h1>
            {!loading && bookings.length > 0 && (
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-300">
                {bookings.length}
                {bookings.length === 1 ? "booking" : "bookings"}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 md:text-base">
            Track your studio sessions, approval status, and total booking cost.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={refreshBookings}
            disabled={loading}
            className="h-10 border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link
            href="/studios"
            className="h-10 bg-violet-600 text-white hover:bg-violet-700 transition-colors px-4 py-2 rounded-lg font-medium"
          >
            Explore Studios
          </Link>
        </div>
      </header>

      {error && !showSkeleton && (
        <div className="flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={refreshBookings}
            className="h-9 border-rose-500/30 bg-transparent text-rose-600 hover:bg-rose-500/15 dark:text-rose-200 dark:hover:text-white"
          >
            Try again
          </Button>
        </div>
      )}

      {showSkeleton && <BookingsSkeleton />}

      {!showSkeleton && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-violet-500/40 hover:shadow-lg dark:border-white/5 dark:bg-[#121212]/80 dark:backdrop-blur-xl dark:hover:shadow-[0_0_40px_-12px_rgba(139,92,246,0.35)]"
            >
              <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-white/5 dark:bg-white/5 sm:h-28 sm:w-40">
                  <BookingStudioImage src={booking.image} alt={booking.studioName} />
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                      {booking.studioName}
                    </h2>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                      {formatBookingDate(booking.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                      {formatBookingTimeRange(booking)}
                    </span>
                  </div>
                  {booking.review && (
                    <div className="text-sm">
                      {[...Array(booking.review.rating)].map(() => "★").join(" ")}
                      {booking.review.comment}
                    </div>
                  )}
                </div>

                <BookingActions
                  booking={booking}
                  onConfirm={() => setConfirmTarget(booking)}
                  onCancel={() => {
                    setCancelError(null);
                    setCancelTarget(booking);
                  }}
                  onReview={() => setReview((prev) => ({ ...prev, target: booking }))}
                  onInvoice={() => downloadInvoice(booking)}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {showEmpty && (
        <EmptyState
          icon={CalendarX2}
          title="No bookings yet"
          description="You have not booked any creative studio sessions yet. Find a space and lock in your next production."
          ctaLabel="Explore Studios"
          ctaHref="/studios"
        />
      )}

      
      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeCancelDialog();
        }}
      >
        <DialogContent
          className="border border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-[#121212] dark:text-white sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Cancel this booking?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              {cancelTarget
                ? `${cancelTarget.studioName} on ${formatBookingDate(cancelTarget.date)} (${formatBookingTimeRange(cancelTarget)}) will be released. This cannot be undone.`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          {cancelError && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{cancelError}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isCancelling}
              onClick={closeCancelDialog}
              className="h-10 border-gray-200 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Keep booking
            </Button>
            <Button
              type="button"
              disabled={isCancelling}
              onClick={() => void handleCancelBooking()}
              className="h-10 gap-2 bg-rose-600 text-white hover:bg-rose-700"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Cancel booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     
      <Dialog
        open={confirmTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeConfirmDialog();
        }}
      >
        <DialogContent
          className="border border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-[#121212] dark:text-white sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Confirm this booking?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              {confirmTarget
                ? `Are you sure you want to confirm the booking for ${confirmTarget.studioName}?`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {confirmError && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{confirmError}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isConfirming}
              onClick={() => {
                setConfirmTarget(null);
                setConfirmError(null);
              }}
              className="h-10 border-gray-200 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isConfirming}
              onClick={() => void handleConfirmBooking()}
              className="h-10 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog
        open={review.target !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeReviewDialog();
        }}
      >
        <DialogContent
          className="border border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-[#121212] dark:text-white sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Write a Review</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Button
                key={i}
                size="sm"
                variant={review.rating === i ? "default" : "outline"}
                onClick={() => setReview((prev) => ({ ...prev, rating: i }))}
              >
                {i}
              </Button>
            ))}
          </div>

          <Textarea
            value={review.comment}
            onChange={(e) =>
              setReview((prev) => ({ ...prev, comment: e.target.value }))
            }
            placeholder="Add a comment"
            className="mb-4"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeReviewDialog}
              className="h-10 border-gray-200 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={review.isSubmitting}
              onClick={() => void handleSubmitReview()}
              className="h-10 gap-2 bg-violet-600 text-white hover:bg-violet-700"
            >
              {review.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Submit Review</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}