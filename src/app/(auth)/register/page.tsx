import type { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a Creativo account to book studios, host your own creative space, and manage bookings in one place.",
};

export default function RegisterPage() {
  return <SignUpForm />;
}
