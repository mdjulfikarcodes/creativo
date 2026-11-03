import type { Metadata } from "next";

import MyBookingsView from "@/components/booking/MyBookingsView";

export const metadata: Metadata = {
  title: "My Bookings",
  description:
    "Track your Creativo studio bookings, approval status, and total session cost.",
};

export default function MyBookingsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-10 text-white sm:px-6 md:py-14 lg:px-8">
      <MyBookingsView />
    </main>
  );
}
