"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
 
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Invalid email or password");
        return;
      }

      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
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
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000/",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 p-4 dark:bg-[#050505]">

      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-[#8b5cf6]/20 blur-[120px] dark:bg-[#8b5cf6]/10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/20 blur-[120px] dark:bg-blue-500/10 pointer-events-none" />

      <div className="z-10 w-full max-w-md rounded-3xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-[#121212]/80 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">

  
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
        
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#8b5cf6] to-[#6d28d9] shadow-lg shadow-[#8b5cf6]/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Creativo<span className="text-[#8b5cf6]">.</span>
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Creative studio rentals made simple
          </p>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Welcome back
        </h1>

        <form onSubmit={handleLogin} className="space-y-4 mb-6">
       
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#1a1a1a] py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white shadow-sm transition-all focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/20 dark:focus:bg-[#1a1a1a]"
                placeholder="you@example.com"
              />
            </div>
          </div>

        
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Password
              </label>
              <button
                type="button"
                onClick={() =>
                  toast.info("Password reset instructions will be sent to your email.")
                }
                className="text-xs font-semibold text-[#8b5cf6] hover:underline dark:text-[#a78bfa]"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#1a1a1a] py-3 pl-11 pr-11 text-sm text-gray-900 dark:text-white shadow-sm transition-all focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/20 dark:focus:bg-[#1a1a1a]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition-colors hover:text-[#8b5cf6] dark:hover:text-[#a78bfa]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
    
            className="mt-2 w-full rounded-xl bg-linear-to-r from-[#8b5cf6] to-[#7c3aed] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#8b5cf6]/30 transition-all hover:scale-[1.02] hover:shadow-[#8b5cf6]/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

       
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#1a1a1a] py-3 flex items-center justify-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:shadow-md disabled:opacity-70"
        >

          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
            alt="Google Logo"
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
          />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#8b5cf6] font-bold hover:underline dark:text-[#a78bfa]">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}