'use client';

import { Icons } from '@/config/icons';

export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-primary/10 flex items-center justify-between px-8 sticky top-0 z-[100]">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Icons.search
            size={20}
            className="absolute left-4 text-secondary pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-3 pl-12 pr-4 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-8">
        {/* User Profile */}
        <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-background cursor-pointer transition-all duration-200 border border-primary/10 hover:bg-accent hover:border-accent group">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-background text-sm font-semibold flex-shrink-0">
            NB
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-primary font-body whitespace-nowrap">
              Nano Banana
            </span>
            <span className="text-xs text-secondary font-body whitespace-nowrap">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
