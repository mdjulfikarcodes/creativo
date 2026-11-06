"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { getApiBaseUrl } from "@/lib/booking";
import { useSession, getBearerToken } from "@/lib/auth-client";

type WriteReviewFormProps = {
  studioId: string;
};

export default function WriteReviewForm({ studioId }: WriteReviewFormProps) {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const baseUrl = getApiBaseUrl();
      if (!baseUrl || !email) return;
      const res = await fetch(
        `${baseUrl}/booking/my-bookings?userEmail=${encodeURIComponent(email)}`,
        {
          credentials: "include",
          headers: { Authorization: `Bearer ${await getBearerToken()}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.bookings || data.data || []);
        const found = arr.find(
          (b: any) => String(b.studioId) === String(studioId) && b.status === "Completed",
        );
        if (found) setBookingId(found._id || found.id);
      }
    })();
  }, [email, studioId]);

  const handleSubmit = async () => {
    if (!bookingId) return;
    setSubmitting(true);
    try {
      const token = await getBearerToken();
      const res = await fetch(`${getApiBaseUrl()}/studio/${studioId}/review`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      toast.add({ type: "success", title: "Review submitted" });
      setRating(5);
      setComment("");
    } catch {
      toast.add({ type: "error", title: "Review failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10 border-t border-gray-200 pt-8 dark:border-white/5">
      {bookingId ? (
        <>
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Write a Review
          </h2>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                className={`h-9 w-9 rounded-lg border ${
                  i <= rating
                    ? "bg-violet-500 text-white border-violet-500"
                    : "border-gray-200 text-gray-400 hover:bg-violet-50 hover:text-violet-500 dark:border-white/10 dark:text-gray-500 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
                }`}
              >
                <Star
                  className="h-5 w-5"
                  fill={i <= rating ? "currentColor" : "none"}
                  stroke={i <= rating ? "none" : "currentColor"}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience"
            className="mb-4"
          />
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            className="w-full h-10 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </>
      ) : (
        <>
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Write a Review
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You must complete a booking to leave a review.
          </p>
          <button
            type="button"
            disabled
            className="w-full h-10 bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed"
          >
            Submit Review
          </button>
        </>
      )}
    </div>
  );
}
