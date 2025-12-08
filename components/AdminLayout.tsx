'use client';

import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(280);

  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarWidth(e.detail.width);
    };

    window.addEventListener('sidebarToggle' as any, handleSidebarChange);
    return () => window.removeEventListener('sidebarToggle' as any, handleSidebarChange);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar onWidthChange={setSidebarWidth} />

      {/* Main Content Area */}
      <div 
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
