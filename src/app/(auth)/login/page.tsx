"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn.email({ email, password });
      toast.success("Welcome back!");
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn.social({ 
        provider: "google",
        callbackURL: "http://localhost:3000", // Redirect to home after Google login.
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed.";
      toast.error(message);
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

        <h1 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-8">
          Welcome back
        </h1>

        <form onSubmit={handleLogin} className="space-y-5 mb-8">
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

          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#8b5cf6] font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a] px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30 outline-none transition-all"
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#8b5cf6] px-4 py-3 text-white font-semibold hover:bg-[#7c3aed] disabled:opacity-70 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-[#8b5cf6]/30"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-white/5"></span>
            <span className="px-3 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-[#121212]">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] disabled:opacity-70 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55.23 11.35.23 14.26s1.2 5.71 2.95 7.04l3.66-2.79z" />
            <path d="M12 5.38c1.62 0 3.06.55 4.21 1.56l3.15-3.15C17.45 2.09 14.75 1 12 1 7.7 1 3.99 3.47 2.18 7.07h3.66c.87-2.6 3.3-4.53 6.16-4.53" />
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#8b5cf6] font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}