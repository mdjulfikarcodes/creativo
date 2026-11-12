import { StepCard } from "@/components/cards";
import SectionHeading from "@/components/shared/SectionHeading";

const bookingSteps = [
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

export default function HowBookingWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-booking-works-heading"
      className="relative w-full bg-white text-gray-900 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="how-booking-works-heading"
          eyebrow="Frictionless Production"
          title="How Booking Works"
          description="Four straightforward steps from concept storyboard to your first shoot day on set."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bookingSteps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
