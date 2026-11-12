"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

 
  function isValidEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  }

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSent(true);
      toast.success("Password reset link sent to your email.");
    } catch {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-[#0a0a0a]">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-[#121212]">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Creativo<span className="text-[#8b5cf6]">.</span>
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Creative studio rentals made simple
          </p>
        </div>

        {sent ? (

          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Mail className="h-8 w-8" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white">
              Reset link sent
            </h2>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              We&apos;ve emailed you a link to reset your password. Please check your inbox.
            </p>

            <Link
              href="/login"
              className="w-full rounded-lg bg-[#8b5cf6] px-4 py-3 text-white font-semibold text-center hover:bg-[#7c3aed] transition-all"
            >
              Back to Login
            </Link>
          </div>
        ) : (
 
          <div className="space-y-5">
            <h1 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-8">
              Forgot Password
            </h1>

            <form onSubmit={handleSendResetLink} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a] px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30 outline-none transition-all dark:placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#8b5cf6] px-4 py-3 text-white font-semibold hover:bg-[#7c3aed] disabled:opacity-70 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-[#8b5cf6]/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <Link href="/login" className="text-[#8b5cf6] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
