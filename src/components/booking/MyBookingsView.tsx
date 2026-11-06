"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 👈 নতুন ইম্পোর্ট
import {
  AlertCircle,
  CalendarDays,
  CalendarX2,
  Clock,
  Loader2,
  RefreshCw,
  XCircle,
  CheckCircle,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import jsPDF from "jspdf";
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
import { useSession, getBearerToken } from "@/lib/auth-client";
import {
  fetchMyBookings,
  formatBookingDate,
  formatBookingTimeRange,
  formatPrice,
  getApiBaseUrl,
  type Booking,
  type BookingStatus,
} from "@/lib/booking";

const STATUS_STYLES: Record<BookingStatus, string> = {
  Pending: "border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-300",
  Confirmed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
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

export default function MyBookingsView() {
  const router = useRouter(); // 👈 রাউটার ইনিশিয়ালাইজ
  const { data: session, isPending: sessionPending } = useSession();
  const email = session?.user?.email ?? "";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancel স্টেট
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Confirm স্টেট
  const [confirmTarget, setConfirmTarget] = useState<Booking | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Review 상태
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!email) {
      setError("Please sign in to view your bookings.");
      setLoading(false);
      return;
    }

    try {
      const nextBookings = await fetchMyBookings(email);
      setBookings(nextBookings);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your bookings.",
      );
    } finally {
      setLoading(false);
    }
  }, [email]);

  const refreshBookings = () => {
    setLoading(true);
    setError(null);
    void fetchBookings();
  };

  useEffect(() => {
    if (sessionPending || !email) return;

    const controller = new AbortController();
    let active = true;

    fetchMyBookings(email, controller.signal)
      .then((nextBookings) => {
        if (!active) return;
        setBookings(nextBookings);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load your bookings.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [email, sessionPending]);

  const closeConfirmDialog = () => {
    if (confirming) return;
    setConfirmTarget(null);
    setConfirmError(null);
  };

  // Confirm হ্যান্ডলার
  async function handleConfirmBooking() {
    if (!confirmTarget) return;
    setConfirming(true);
    setConfirmError(null);

    try {
      const baseUrl = getApiBaseUrl();
      const token = await getBearerToken();
      const response = await fetch(
        `${baseUrl}/booking/${encodeURIComponent(confirmTarget.id)}/confirm`,
        {
          method: "PATCH",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          typeof body?.message === "string"
            ? body.message
            : `Could not confirm this booking (${response.status}).`;
        throw new Error(message);
      }

      toast.add({
        type: "success",
        title: "Booking Confirmed",
        description: `${confirmTarget.studioName} is now confirmed.`,
      });

      const confirmedId = confirmTarget.id;
      setConfirmTarget(null);
      setConfirmError(null);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === confirmedId ? { ...b, status: "Confirmed" } : b,
        ),
      );

      // 👇 ড্যাশবোর্ডের My Bookings পেজে রিডাইরেক্ট
      router.push("/dashboard/my-bookings");
      router.refresh();

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
      setConfirming(false);
    }
  }

  async function handleSubmitReview() {
    if (!reviewTarget) return;
    setSubmitting(true);
    try {
      const token = await getBearerToken();
      const res = await fetch(
        `${getApiBaseUrl()}/studio/${encodeURIComponent(reviewTarget.studioId || reviewTarget.id)}/review`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            rating: Number(reviewRating),
            comment: reviewComment,
          }),
        },
      );
      if (!res.ok) throw new Error("Failed to submit review");

      toast.add({
        type: "success",
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setReviewTarget(null);
      setReviewRating("5");
      setReviewComment("");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === reviewTarget.id
            ? { ...b, review: { rating: Number(reviewRating), comment: reviewComment } }
            : b,
        ),
      );
    } catch (err) {
      toast.add({
        type: "error",
        title: "Review failed",
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const closeCancelDialog = () => {
    if (cancelling) return;
    setCancelTarget(null);
    setCancelError(null);
  };

  async function handleCancelBooking() {
    if (!cancelTarget) return;
    const booking = cancelTarget;
    setCancelling(true);
    setCancelError(null);

    try {
      const baseUrl = getApiBaseUrl();
      const token = await getBearerToken();
      const response = await fetch(
        `${baseUrl}/booking/${encodeURIComponent(booking.id)}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          typeof body?.message === "string"
            ? body.message
            : `Could not cancel this booking (${response.status}).`;
        throw new Error(message);
      }

      toast.add({
        type: "success",
        title: "Booking cancelled",
        description: `${booking.studioName} on ${formatBookingDate(booking.date)} has been cancelled.`,
      });

      setCancelTarget(null);
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.id === booking.id ? { ...b, status: "Cancelled" } : b,
        ),
      );
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
      setCancelling(false);
    }
  }

  const signInError =
    !sessionPending && !email ? "Please sign in to view your bookings." : null;
  const displayError = error ?? signInError;
  const showSkeleton =
    (sessionPending || (loading && Boolean(email))) && bookings.length === 0;

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
                {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
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
            className={buttonVariants({
              className: "h-10 bg-violet-600 text-white hover:bg-violet-700 transition-colors",
            })}
          >
            Explore Studios
          </Link>
        </div>
      </header>

      {displayError && !showSkeleton && (
        <div className="flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{displayError}</p>
          </div>
          {email && (
            <Button
              type="button"
              variant="outline"
              onClick={refreshBookings}
              className="h-9 border-rose-500/30 bg-transparent text-rose-600 hover:bg-rose-500/15 dark:text-rose-200 dark:hover:text-white"
            >
              Try again
            </Button>
          )}
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
                  <Image
                    src={booking.image}
                    alt={booking.studioName}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 160px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
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
                      {[...Array(booking.review.rating)]
                        .map(() => "★")
                        .join(" ")}
                      {booking.review.comment}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start gap-4 border-t border-gray-200 pt-4 dark:border-white/5 sm:items-end sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
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
                        onClick={() => setConfirmTarget(booking)}
                        className="h-9 bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Confirm
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCancelError(null);
                          setCancelTarget(booking);
                        }}
                        className="h-9 border-gray-200 bg-white text-gray-700 hover:border-rose-500/40 hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Cancel
                      </Button>
                    </div>
                  )}
                  {booking.status === "Completed" && !booking.review && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setReviewTarget(booking)}
                    >
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
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
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
                      }}
                    >
                      Download Invoice
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!showSkeleton && !displayError && bookings.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-white/5 dark:bg-[#121212]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <CalendarX2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">No bookings yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            You have not booked any creative studio sessions yet. Find a space and
            lock in your next production.
          </p>
          <Link
            href="/studios"
            className={buttonVariants({
              className: "mt-6 h-10 bg-violet-600 text-white hover:bg-violet-700 transition-colors",
            })}
          >
            Explore Studios
          </Link>
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeCancelDialog();
        }}
      >
        <DialogContent className="border border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-[#121212] dark:text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Cancel this booking?</DialogTitle>
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
              disabled={cancelling}
              onClick={closeCancelDialog}
              className="h-10 border-gray-200 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Keep booking
            </Button>
            <Button
              type="button"
              disabled={cancelling}
              onClick={() => void handleCancelBooking()}
              className="h-10 gap-2 bg-rose-600 text-white hover:bg-rose-700"
            >
              {cancelling ? (
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

      {/* Confirm Dialog */}
      <Dialog
        open={confirmTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeConfirmDialog();
        }}
      >
        <DialogContent className="border border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-[#121212] dark:text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Confirm this booking?</DialogTitle>
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
              disabled={confirming}
              onClick={closeConfirmDialog}
              className="h-10 border-gray-200 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={confirming}
              onClick={() => void handleConfirmBooking()}
              className="h-10 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {confirming ? (
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

      {/* Review Dialog */}
      <Dialog
        open={reviewTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setReviewTarget(null);
        }}
      >
        <DialogContent className="border border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-[#121212] dark:text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Write a Review
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Button
                key={i}
                size="sm"
                variant={
                  reviewRating === String(i) ? "default" : "outline"
                }
                onClick={() => setReviewRating(String(i))}
              >
                {i}
              </Button>
            ))}
          </div>

          <Textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Add a comment"
            className="mb-4"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewTarget(null)}
              className="h-10 border-gray-200 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmitReview()}
              className="h-10 gap-2 bg-violet-600 text-white hover:bg-violet-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}