"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Award,
  Users2,
  Sparkles,
  ArrowRight,
  Globe2,
} from "lucide-react";

export default function AboutPage() {
  const router = useRouter();

  const values = [
    {
      title: "Production Transparency",
      desc: "No hidden power drop fees, unexpected overtime surcharges, or vague rules. Every square foot and piece of grip gear is explicitly itemized.",
    },
    {
      title: "Certified Rigging & Safety",
      desc: "All listed sound stages and cycs undergo on-site physical audits verifying Camlock electrical drops, truss tolerances, and emergency egress.",
    },
    {
      title: "Creator Sovereignty",
      desc: "We build direct relationships between studio proprietors and creators, preserving independent production budgets while maximizing host earnings.",
    },
  ];

  const leadership = [
    {
      name: "Julianne Vance",
      role: "Co-Founder & CEO",
      bio: "Former Executive Producer at RadicalMedia with 14 years managing commercial sets across London, New York, and Los Angeles.",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Marcus Sterling",
      role: "Head of Studio Infrastructure",
      bio: "Architectural acoustician and former stage master for Paramount Studios. Specializes in STC isolation and silent HVAC systems.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Amina Osei",
      role: "VP of Trust & Creator Safety",
      bio: "Legal counsel specializing in commercial entertainment liability, production bonding, and intellectual property rights.",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] py-16 md:py-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Mission Hero */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 text-[#8b5cf6] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Our Founding Purpose</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            Democratizing world-class production spaces for every creator.
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Creativo was founded by working cinematographers and creative directors who grew exhausted with opaque scout fees, broken cyc floors, and unreliable booking confirmations. We built the marketplace we wished existed.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl border border-gray-100 dark:border-white/10 bg-[#F8F9FB] dark:bg-white/5 text-center">
          <div>
            <div className="text-3xl font-extrabold text-[#8b5cf6] tabular-nums">480+</div>
            <div className="text-xs text-gray-500 mt-1">Certified Studios</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#8b5cf6] tabular-nums">24,000+</div>
            <div className="text-xs text-gray-500 mt-1">Shoot Hours Booked</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#8b5cf6] tabular-nums">99.8%</div>
            <div className="text-xs text-gray-500 mt-1">Host Check-In Reliability</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#8b5cf6] tabular-nums">$1M</div>
            <div className="text-xs text-gray-500 mt-1">Liability Policy Per Shoot</div>
          </div>
        </div>

        {/* Core Principles */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              The Creativo Standard
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Every space on our platform is evaluated under strict professional criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="p-8 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#121212] shadow-sm space-y-3"
              >
                <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-[#8b5cf6] flex items-center justify-center text-xs font-bold">
                  0{i + 1}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {v.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Built by Production Veterans
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Our team bridges enterprise Hollywood stages and grassroots maker ateliers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((member, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-100 dark:border-white/10 bg-[#F8F9FB] dark:bg-white/5 p-6 space-y-4 text-center flex flex-col items-center"
              >
                {/* Next.js Image Component */}
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-xs font-medium text-[#8b5cf6]">{member.role}</p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="rounded-2xl bg-gray-950 text-white p-8 sm:p-12 text-center space-y-6 border border-white/10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to find your next shoot location?
          </h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Browse verified cyclorama lofts, sound stages, and broadcast rooms in New York, Los Angeles, and nationwide.
          </p>
          <div className="pt-2 flex justify-center">
            {/* Custom Button */}
            <button
              onClick={() => router.push("/studios")}
              className="inline-flex items-center justify-center rounded-lg bg-[#8b5cf6] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#8b5cf6]/30 transition-all hover:bg-[#7c3aed]"
            >
              Explore All Studios
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}