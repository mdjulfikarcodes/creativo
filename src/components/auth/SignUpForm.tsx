// src/app/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/toast";
import { signUp, signIn } from "@/lib/auth-client"; // 👈 signIn যোগ করা হলো

const signUpSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name"),
    email: z.string().email("Enter a valid email address"),
    photoUrl: z.string().url("Enter a valid image URL").or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be 72 characters or fewer"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z
      .boolean()
      .refine((accepted) => accepted, "Please accept the terms to continue"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

const inputClassName =
  "h-11 rounded-xl border-gray-200 bg-white px-3.5 text-sm shadow-sm placeholder:text-gray-400 focus-visible:border-[#8b5cf6] focus-visible:ring-[#8b5cf6]/20 dark:border-white/10 dark:bg-white/[0.03] dark:placeholder:text-gray-500";

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // 👈 নতুন স্টেট

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      photoUrl: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  // 👇 Google সাইন-আপ ফাংশন
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/", // সফল হলে হোম পেজে যাবে
      });
    } catch {
      toast.add({
        type: "error",
        title: "Google Sign-up Failed",
        description: "Something went wrong. Please try again.",
      });
      setIsGoogleLoading(false);
    }
  };

  async function onSubmit(values: SignUpValues) {
    setServerError(null);

    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      image: values.photoUrl || undefined,
      photoUrl: values.photoUrl || undefined,
      callbackURL: "/login",
      fetchOptions: {
        onSuccess: () => {
          toast.add({
            type: "success",
            title: "Account created",
            description: "Your account is ready. Please sign in to continue.",
          });
          router.push("/login");
          router.refresh();
        },
        onError: (ctx) => {
          setServerError(
            ctx.error.message ||
              "We couldn't create your account. Please try again."
          );
        },
      },
    });

    if (error) {
      setServerError(
        error.message || "We couldn't create your account. Please try again."
      );
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[#8b5cf6]">Join Creativo</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Book verified studios, host your own space, and manage everything in one place.
      </p>

      {/* 👇 Google সাইন-আপ বাটন */}
      <div className="mt-8 space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading}
          className="w-full h-11 rounded-xl border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-[#121212] dark:text-white dark:hover:bg-white/5 flex items-center justify-center gap-2"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {isGoogleLoading ? "Connecting..." : "Continue with Google"}
        </Button>

        {/* ডিভাইডার */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 dark:bg-[#0a0a0a] dark:text-gray-400">
              Or sign up with email
            </span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter Your Full Name"
                    autoComplete="name"
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter Your Email Address"
                    autoComplete="email"
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="photoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="Image URL"
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className={`${inputClassName} pr-11`}
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use at least 8 characters with a mix of letters, numbers and symbols.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className={`${inputClassName} pr-11`}
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex flex-row items-start gap-2.5">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                  </FormControl>
                  <FormLabel className="cursor-pointer text-sm leading-snug font-normal text-gray-600 dark:text-gray-400">
                    I agree to the{" "}
                    <Link href="/terms" className="font-medium text-[#8b5cf6] hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-medium text-[#8b5cf6] hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-11 w-full rounded-xl bg-[#8b5cf6] text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-colors hover:bg-[#7c3aed] disabled:opacity-70"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#8b5cf6] transition-colors hover:text-[#7c3aed] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}