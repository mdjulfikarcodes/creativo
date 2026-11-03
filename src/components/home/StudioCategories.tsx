import { CategoryCard } from "@/components/cards";
import SectionHeading from "@/components/shared/SectionHeading";
import { studioCategories } from "@/lib/data/categories";

export default function StudioCategories() {
  return (
    <section
      id="categories"
      aria-labelledby="studio-categories-heading"
      className="w-full bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="studio-categories-heading"
          eyebrow="Curated Production Spaces"
          title="Browse by Studio Category"
          description="Select your required production environment from high-cove cycs to soundproof broadcast rooms."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {studioCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
