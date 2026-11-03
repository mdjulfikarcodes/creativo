import type { Metadata } from "next";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Creativo to book verified photo studios, sound stages, and creative spaces by the hour.",
};

export default function LoginPage() {
  return <SignInForm />;
}
