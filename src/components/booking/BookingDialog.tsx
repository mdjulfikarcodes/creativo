"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarDays, CalendarPlus, Clock, Loader2 } from "lucide-react";

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
import { authClient, useSession } from "@/lib/auth-client";

type BookingDialogProps = {
  studioId: string;
  studioTitle: string;
  studioImage: string;
  hourlyRate: number;
};

const inputClassName =
  "h-10 border-white/10 bg-[#0a0a0a] text-white [color-scheme:dark] placeholder:text-gray-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30";

export default function BookingDialog({
  studioId,
  studioTitle,
  studioImage,
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

  const { data: session, isPending: sessionPending } = useSession();

  const handleOpenChange = (nextOpen: boolean) => {
    if (submitting) return;
    setOpen(nextOpen);
    if (nextOpen) {
      setError(null);
      setConflict(false);
    }
  };

  function getDurationHours(): number {
    const start = startTime.split(":").map(Number);
    const end = endTime.split(":").map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return endMinutes > startMinutes ? (endMinutes - startMinutes) / 60 : 0;
  }

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

    const hours = getDurationHours();
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

    
    const { data } = await authClient.token();
    const token = data?.token;
    const baseUrl = (process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? "").replace(
      /\/+$/,
      ""
    );

    setSubmitting(true);

    try {
      const response = await fetch(`${baseUrl}/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}), 
        },
        body: JSON.stringify({
          studioId,
          studioTitle,
          studioImage,
          date,
          startTime,
          endTime,
          totalPrice: Math.round(hours * hourlyRate * 100) / 100,
        }),
      });

      if (response.status === 409) {
        setConflict(true);
        setError(null);
        toast.add({
          type: "error",
          title: "This time slot is already booked.",
          description: "Please choose another time.",
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
        description: `${studioTitle} on ${date} is awaiting host approval.`,
      });

      setOpen(false);
      router.push("/dashboard/my-bookings");
      router.refresh();
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
                {Math.round(hourlyRate * 100) / 100} BDT/hr
              </span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="booking-date" className="text-xs font-medium text-gray-300">
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
                <label htmlFor="booking-start-time" className="text-xs font-medium text-gray-300">
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
                <label htmlFor="booking-end-time" className="text-xs font-medium text-gray-300">
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
                  {getDurationHours() > 0 ? `${getDurationHours()} hrs` : "—"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-400">Hourly rate</span>
                <span className="font-medium text-white">
                  {Math.round(hourlyRate * 100) / 100} BDT
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-sm font-medium text-gray-300">
                  Total price
                </span>
                <span className="text-lg font-bold text-violet-300">
                  {Math.round(getDurationHours() * hourlyRate * 100) / 100}
                  <span className="text-xs font-semibold">BDT</span>
                </span>
              </div>
            </div>

            {conflict && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Time slot already booked</p>
                  <p className="text-xs text-rose-300/80">
                    Pick a different date or time to continue.
                  </p>
                </div>
              </div>
            )}

            {sessionPending && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking session...</span>
              </div>
            )}

            {!sessionPending && !session?.user && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Please sign in to book this workspace.</p>
              </div>
            )}

            {error && !conflict && !session?.user && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
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
                disabled={submitting || !session?.user || sessionPending}
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