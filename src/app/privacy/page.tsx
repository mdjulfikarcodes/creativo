import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Creativo",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          This Privacy Policy describes how Creativo collects, uses, and protects your personal information when you use our studio booking platform.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          We are committed to protecting your privacy and being transparent about our data practices.
        </p>
        <div className="mt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-violet-600 font-medium hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
