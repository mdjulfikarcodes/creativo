"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CalendarPlus,
  Clock,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import {
  calculateHours,
  formatBookingDate,
  formatPrice,
  getApiBaseUrl,
} from "@/lib/booking";

type BookingDialogProps = {
  studioId: string;
  studioTitle: string;
  hourlyRate: number;
};

const inputClassName =
  "h-10 border-white/10 bg-[#0a0a0a] text-white [color-scheme:dark] placeholder:text-gray-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30";

export default function BookingDialog({
  studioId,
  studioTitle,
  hourlyRate,
}: BookingDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("13:00");
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hours = useMemo(
    () => calculateHours(startTime, endTime),
    [startTime, endTime],
  );
  const totalPrice = useMemo(
    () => Math.round(hours * hourlyRate * 100) / 100,
    [hours, hourlyRate],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (submitting) return;

    setOpen(nextOpen);

    if (nextOpen) {
      setError(null);
      setConflict(false);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setConflict(false);

    if (!date) {
      setError("Please choose a booking date.");
      return;
    }

    if (!startTime || !endTime) {
      setError("Please choose a start and end time.");
      return;
    }

    if (hours <= 0) {
      setError("End time must be later than the start time.");
      return;
    }

    if (!studioId) {
      setError("This studio is missing an id, so it cannot be booked right now.");
      return;
    }

    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
      setError("This studio does not have a valid hourly rate yet.");
      return;
    }

    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      setError("Booking API is not configured. Set NEXT_PUBLIC_SERVER_BASE_URL.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${baseUrl}/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          studioId,
          date,
          startTime,
          endTime,
          totalPrice,
        }),
      });

      if (response.status === 409) {
        setConflict(true);
        setError(null);
        toast.add({
          type: "error",
          title: "Time slot already booked",
          description: "Please choose a different date or time.",
        });
        return;
      }

      if (response.status === 401 || response.status === 403) {
        setError("Please sign in to book this workspace.");
        toast.add({
          type: "error",
          title: "Sign in required",
          description: "Please sign in to book this workspace.",
        });
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          typeof body?.message === "string"
            ? body.message
            : `Booking failed (${response.status}).`;
        throw new Error(message);
      }

      toast.add({
        type: "success",
        title: "Booking request sent",
        description: `${studioTitle} on ${formatBookingDate(date)} is awaiting host approval.`,
      });

      setOpen(false);
      router.push("/my-bookings");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while booking this studio.";

      setError(message);
      toast.add({
        type: "error",
        title: "Booking failed",
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="mt-6 h-11 w-full gap-2 bg-[#8b5cf6] text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-colors hover:bg-[#7c3aed]"
      >
        <CalendarPlus className="h-4 w-4" />
        Book Workspace Now
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="border border-white/10 bg-[#121212] text-white ring-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              Book this workspace
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400">
              {studioTitle} ·{" "}
              <span className="font-medium text-violet-400">
                {formatPrice(hourlyRate)} SAR/hr
              </span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="booking-date"
                className="text-xs font-medium text-gray-300"
              >
                Date
              </label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-violet-400" />
                <Input
                  id="booking-date"
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className={`${inputClassName} pl-9`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="booking-start-time"
                  className="text-xs font-medium text-gray-300"
                >
                  Start time
                </label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-violet-400" />
                  <Input
                    id="booking-start-time"
                    type="time"
                    required
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    className={`${inputClassName} pl-9`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="booking-end-time"
                  className="text-xs font-medium text-gray-300"
                >
                  End time
                </label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-violet-400" />
                  <Input
                    id="booking-end-time"
                    type="time"
                    required
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className={`${inputClassName} pl-9`}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Duration</span>
                <span className="font-medium text-white">
                  {hours > 0 ? `${formatPrice(hours)} hrs` : "—"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-400">Hourly rate</span>
                <span className="font-medium text-white">
                  {formatPrice(hourlyRate)} SAR
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-sm font-medium text-gray-300">
                  Total price
                </span>
                <span className="text-lg font-bold text-violet-300">
                  {formatPrice(totalPrice)}{" "}
                  <span className="text-xs font-semibold">SAR</span>
                </span>
              </div>
            </div>

            {conflict && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Time slot already booked</p>
                  <p className="text-xs text-rose-300/80">
                    Pick a different date or time to continue.
                  </p>
                </div>
              </div>
            )}

            {error && !conflict && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <DialogFooter className="border-white/10 bg-transparent">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => handleOpenChange(false)}
                className="h-10 border-white/10 bg-transparent text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-10 gap-2 bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="h-4 w-4" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
