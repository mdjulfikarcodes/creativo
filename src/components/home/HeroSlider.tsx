"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";

// Swiper স্টাইল ইমপোর্ট
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

// 📸 আপনার ৪টি ছবির ডাটা (এখানে আপনার আসল ছবির লিংকগুলো বসাবেন)
const slidesData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2000&auto=format&fit=crop", // Photo Studio
    badge: "PHOTOGRAPHY & EDITORIAL",
    title1: "Where Masterpieces Find",
    title2: "Their Light",
    description: "Book premium photography lofts with 20ft ceilings, flawless infinity cycloramas, and profoto strobe arrays by the hour.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2000&auto=format&fit=crop", // Film Stage
    badge: "CINEMA & COMMERCIALS",
    title1: "Broadcast Soundstages Built",
    title2: "for Scale",
    description: "NC-25 acoustic isolation, 400A Camlock power, heavy-duty lighting truss grids, and drive-in load access for motion shoots.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop", // Music Studio
    badge: "RECORDING & MIXING",
    title1: "Acoustically Tuned Music",
    title2: "Production Suites",
    description: "World-class analog mixing consoles, vintage outboard gear, and Dolby Atmos calibrated monitoring environments.",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2000&auto=format&fit=crop", // Podcast
    badge: "VIDEO & AUDIO PODCASTS",
    title1: "Next-Generation Broadcast &",
    title2: "Podcast Suites",
    description: "Plug-and-record 4K multi-cam switching, acoustic walnut diffusers, and broadcast Shure SM7B arrays ready for your show.",
  }
];

export default function HeroSlider() {
  return (
    <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-black">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 5000, // ⏱️ ৫ সেকেন্ড পর পর স্লাইড হবে
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: ".custom-pagination",
        }}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        loop={true}
        className="w-full h-full"
      >
        {slidesData.map((slide) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title1}
                fill
                priority
                sizes="100vw"
                className="object-cover"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04"; }}
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-black/60"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-10">
              
              {/* Badge */}
              <span className="mb-6 inline-block rounded-md bg-[#8b5cf6] px-3 py-1 text-xs font-bold tracking-widest text-white uppercase">
                {slide.badge}
              </span>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                {slide.title1} <br className="hidden sm:block" />
                {slide.title2}
              </h1>

              {/* Description */}
              <p className="max-w-2xl text-base sm:text-lg text-gray-300 mb-10 leading-relaxed">
                {slide.description}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/studios"
                  className="group flex items-center gap-2 rounded-lg bg-[#8b5cf6] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#7c3aed]"
                >
                  Explore Studios
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 🎯 Custom Navigation Arrows (Left & Right) */}
      <button className="custom-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all cursor-pointer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button className="custom-next absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all cursor-pointer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* 🎯 Custom Pagination Dots (Bottom Center) */}
      <div className="custom-pagination absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2"></div>

      {/* CSS Override for active pagination dot (Swiper default active dot style) */}
      <style jsx global>{`
        .custom-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background-color: rgba(255, 255, 255, 0.4);
          opacity: 1;
          transition: all 0.3s ease;
          border-radius: 50%;
        }
        .custom-pagination .swiper-pagination-bullet-active {
          width: 32px;
          border-radius: 12px;
          background-color: #8b5cf6;
        }
      `}</style>
    </div>
  );
}