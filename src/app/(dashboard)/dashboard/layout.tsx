import React from 'react';
import Sidebar from './_components/Sidebar';

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
    );
};

export default layout;
