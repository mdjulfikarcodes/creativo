"use client";

import React, { Suspense, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import Sidebar from "./_components/Sidebar";
import Navbar from "@/components/shared/Navbar";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="h-20 w-full bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/5" />
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
          <div className="hidden md:block w-62.5 border-r border-gray-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a]" />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
              <div className="h-64 bg-gray-200 dark:bg-white/10 rounded" />
            </div>
          </main>
        </div>
      </div>
    );
  }
  return (
    <div className={`min-h-screen ${resolvedTheme === "dark" ? "bg-[#0a0a0a] text-white" : "bg-gray-50 text-gray-900"}`}>
      <Suspense fallback={<div className="h-20 w-full bg-white dark:bg-[#0a0a0a] animate-pulse" />}>
        <Navbar />
      </Suspense>

      <div className="flex h-[calc(100vh-80px)] overflow-hidden">
        {/* 👇 মোবাইলে সাইডবার লুকানো থাকবে, শুধু md (ট্যাবলেট/পিসি) স্ক্রিনে দেখাবে */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;