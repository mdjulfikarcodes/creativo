// lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import type { Auth } from "@/lib/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
  plugins: [
    inferAdditionalFields<Auth>(), // 👈 কাস্টম ফিল্ড (photoUrl) টাইপ চিনতে সাহায্য করবে
    jwtClient(), // 👈 JWT সাপোর্ট
  ],
  fetchOptions: {
    onResponse: (context) => {
      const token = context.response.headers.get("set-auth-jwt"); // ✅ JWT হেডার
      if (token && typeof window !== "undefined") {
        localStorage.setItem("bearer_token", token);
      }
    },
  },
});

export async function getBearerToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("bearer_token");
  if (stored) return stored;
  await authClient.getSession();
  return localStorage.getItem("bearer_token");
}

export const { signIn, signUp, signOut, useSession } = authClient;

export type Session = typeof authClient.$Infer.Session;