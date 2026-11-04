// lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Auth } from "@/lib/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
  plugins: [inferAdditionalFields<Auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

export type Session = typeof authClient.$Infer.Session;