import { StepCard } from "@/components/cards";
import SectionHeading from "@/components/shared/SectionHeading";
import { bookingSteps } from "@/lib/data/content";

export default function HowBookingWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-booking-works-heading"
      className="relative w-full bg-[#0a0a0a] py-20 md:py-28"
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
