import type { Metadata } from "next";
import AboutPage from "@/components/shared/About";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Creativo is a studio rental marketplace built by working cinematographers and creative directors.",
};

export default function AboutRoute() {
  return <AboutPage />;
}
