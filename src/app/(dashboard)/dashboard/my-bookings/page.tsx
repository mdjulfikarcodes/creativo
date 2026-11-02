"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, FileText, ExternalLink, XCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

// --- Dummy Data (পরে তোমার API থেকে ফেচ করবে) ---
type BookingStatus = "Confirmed" | "Pending";

type Booking = {
  id: string;
  studioName: string;
  image: string;
  date: string;
  time: string;
  hours: number;
  ref: string;
  note: string;
  totalRental: number;
  deposit: number;
  status: BookingStatus;
};

const DUMMY_BOOKINGS: Booking[] = [
  {
    id: "1",
    studioName: "Lumina Grand Cyclorama Stage",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&auto=format&fit=crop",
    date: "2026-11-12",
    time: "10:00 - 15:00",
    hours: 5,
    ref: "#bkg-101",
    note: '"Commercial fashion lookbook shoot with 4 models and hair/makeup crew."',
    totalRental: 725,
    deposit: 300,
    status: "Confirmed",
  },
  {
    id: "2",
    studioName: "The Broadcast Pod & Video Suite",
    image: "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?q=80&w=400&auto=format&fit=crop",
    date: "2026-11-18",
    time: "14:00 - 17:00",
    hours: 3,
    ref: "#bkg-102",
    note: '"Recording 2 episodes for Creativo Tech Dialogues podcast."',
    totalRental: 255,
    deposit: 150,
    status: "Pending",
  },
];

export default function MyBookingsPage() {
  const handleCancel = (booking: Booking) => {
    // এখানে তোমার API কল করবে: PATCH /api/bookings/:id/cancel
    toast.add({
      title: "Booking Cancelled",
      description: `${booking.studioName} (${booking.ref}) has been cancelled successfully.`,
      type: "error",
    });
  };

  const handleDownloadPDF = (booking: Booking) => {
    // এখানে jsPDF দিয়ে ইন্ভয়েস জেনারেট করবে
    toast.add({
      title: "Generating Invoice",
      description: `Your PDF invoice for ${booking.ref} is downloading...`,
      type: "info",
    });
  };

  return (
    <div className="min-h-full bg-slate-950 py-12 px-4 text-slate-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* হেডার সেকশন */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              My Creative Bookings
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Track studio session dates, pending approvals, and download PDF tax invoices.
            </p>
          </div>
          <Link
            href="/studios"
            className={buttonVariants({
              className: "bg-violet-600 text-white hover:bg-violet-700",
            })}
          >
            Explore More Studios
          </Link>
        </div>

        {/* বুকিং লিস্ট */}
        <div className="space-y-4">
          {DUMMY_BOOKINGS.map((booking) => (
            <div 
              key={booking.id} 
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:border-slate-700"
            >
              
              {/* বাম পাশ: ইমেজ এবং ডিটেইলস */}
              <div className="flex flex-col sm:flex-row gap-5 items-start flex-1">
                {/* ইমেজ */}
                <div className="relative w-full sm:w-32 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-800">
                  <Image
                    src={booking.image}
                    alt={booking.studioName}
                    fill
                    sizes="(max-width: 640px) 100vw, 128px"
                    className="object-cover opacity-90"
                  />
                </div>

                {/* টেক্সট কন্টেন্ট */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">{booking.studioName}</h3>
                    {/* স্ট্যাটাস ব্যাজ */}
                    {booking.status === "Confirmed" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-900/50">
                        Confirmed Session
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-500 border border-amber-900/50">
                        Pending Host Approval
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs md:text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{booking.time} ({booking.hours} hrs)</span>
                    </div>
                    <div className="hidden sm:block text-slate-500">
                      Ref: {booking.ref}
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 italic mt-1">
                    {booking.note}
                  </p>
                </div>
              </div>

              {/* ডান পাশ: প্রাইসিং এবং অ্যাকশন বাটন */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                
                {/* প্রাইসিং */}
                <div className="text-left lg:text-right">
                  <p className="text-xs text-slate-400 mb-1">Total Rental</p>
                  <p className="text-2xl font-bold text-white">${booking.totalRental}</p>
                  <p className="text-xs text-slate-500">+ ${booking.deposit} deposit</p>
                </div>

                {/* অ্যাকশন বাটন */}
                <div className="flex items-center gap-2">
                  {booking.status === "Confirmed" ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadPDF(booking)}
                      className="border-slate-700 text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 h-9"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      PDF Invoice
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCancel(booking)}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-9"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </Button>
                  )}
                  
                  {/* এক্সটার্নাল লিংক আইকন */}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`View details for ${booking.studioName}`}
                    className="h-9 w-9 text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
