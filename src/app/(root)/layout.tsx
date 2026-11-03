import { Suspense, type ReactNode } from 'react';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';

const layout = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            {/* ১. Navbar-কে Suspense দিয়ে ঘিরে দাও */}
            <Suspense fallback={
                <div className="sticky top-0 z-50 w-full h-20 border-b border-gray-200 bg-white dark:border-white/5 dark:bg-[#0a0a0a] animate-pulse" />
            }>
                <Navbar />
            </Suspense>
            
            {children}
            
            <Footer />
        </div>
    );
};

export default layout;