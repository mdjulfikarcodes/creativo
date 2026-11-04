import type { Metadata } from "next";

import MyBookingsView from "@/components/booking/MyBookingsView";

export const metadata: Metadata = {
  title: "My Bookings",
  description:
    "Track your Creativo studio bookings, approval status, and total session cost.",
};

export default function DashboardMyBookingsPage() {
  return <MyBookingsView />;
}
