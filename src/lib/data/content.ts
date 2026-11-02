import {
  Headphones,
  ShieldCheck,
  UserCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type Step = {
  number: string;
  title: string;
  description: string;
};

export type Guarantee = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const bookingSteps: Step[] = [
  {
    number: "01",
    title: "Discover Verified Spaces",
    description:
      "Filter by ceiling height, lighting gear, power distro, and acoustic specs tailored to your creative brief.",
  },
  {
    number: "02",
    title: "Select Shoot Hours",
    description:
      "Choose your exact production timeline with instant transparent pricing, cleaning fees, and zero hidden markups.",
  },
  {
    number: "03",
    title: "Book Instantly",
    description:
      "Submit your request with project brief. Confirmed reservations receive immediate gate codes and host check-in specs.",
  },
  {
    number: "04",
    title: "Create & Produce",
    description:
      "Step into a fully prepped, sanitized workspace equipped with certified gear and comprehensive liability coverage.",
  },
];

export const hostingSteps: Step[] = [
  {
    number: "01",
    title: "Share Your Space",
    description:
      "Tell us about your studio's dimensions, power, acoustics, and the gear that is already on site.",
  },
  {
    number: "02",
    title: "Get Verified",
    description:
      "Our team audits your space for safety, load tolerances, and production readiness before it goes live.",
  },
  {
    number: "03",
    title: "Start Earning",
    description:
      "Publish your availability, approve booking requests, and get paid after every confirmed shoot.",
  },
];

export const guarantees: Guarantee[] = [
  {
    title: "SAR 3.5M Liability Protection",
    description:
      "Every reservation is safeguarded against property damage and third-party liabilities at no extra charge.",
    icon: ShieldCheck,
  },
  {
    title: "Verified Hosts & Creators",
    description:
      "Identity verification, equipment inspection checks, and community reviews keep our creative network trusted.",
    icon: UserCheck,
  },
  {
    title: "Certified Gear & Specs",
    description:
      "Every lighting rig, cyc wall, and power drop is verified for real production load tolerances.",
    icon: Wrench,
  },
  {
    title: "24/7 Production Support",
    description:
      "Our dedicated studio concierge is on standby during your active call sheet to resolve access or gear needs.",
    icon: Headphones,
  },
];
