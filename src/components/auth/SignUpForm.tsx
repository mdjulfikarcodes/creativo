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
import { signUp } from "@/lib/auth-client";

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

  async function onSubmit(values: SignUpValues) {
    setServerError(null);

    // ✅ FIX: callbackURL যোগ + onSuccess-এ navigate
    // ড্যাশবোর্ড না থাকলে "/" (হোম) দিন।
    // ড্যাশবোর্ড চাইলে আগে src/app/dashboard/page.tsx বানান।
    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      image: values.photoUrl || undefined,
      photoUrl: values.photoUrl || undefined,
      callbackURL: "/",
      fetchOptions: {
        onSuccess: () => {
          toast.add({
            type: "success",
            title: "Account created",
            description: "Welcome to Creativo. Let's find your first studio.",
          });
          router.push("/");      // ✅ হোম পেজ
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