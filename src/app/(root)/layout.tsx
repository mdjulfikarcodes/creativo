import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';
import React, { Suspense } from 'react';

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            {/* ১. Navbar-কে Suspense দিয়ে ঘিরে দাও */}
            <Suspense fallback={
                <div className="sticky top-0 z-50 w-full h-20 border-b border-white/5 bg-[#0a0a0a] animate-pulse" />
            }>
                <Navbar />
            </Suspense>
            
            {children}
            
            <Footer />
        </div>
    );
};

export default layout;