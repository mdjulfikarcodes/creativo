"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Auth } from "@/lib/auth";

export const authClient = createAuthClient({
  // Better Auth server runs on port 5000, so baseURL points directly to the backend URL.
  baseURL: process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000",
  plugins: [
    inferAdditionalFields<Auth>(),
  ],
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
export type Session = typeof authClient.$Infer.Session;