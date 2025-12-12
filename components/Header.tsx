'use client';

import { useState } from 'react';
import { Icons } from '@/config/icons';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

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
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 py-2 px-4 rounded-lg bg-background cursor-pointer transition-all duration-200 border border-primary/10 hover:border-accent hover:shadow-sm group"
          >
            {/* User Avatar */}
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-accent/20"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white text-sm font-bold shadow-sm ${
                user?.photoURL ? 'hidden' : 'flex'
              }`}
            >
              {user?.name?.charAt(0).toUpperCase() || <Icons.users size={20} />}
            </div>

            {/* User Info */}
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-primary font-body whitespace-nowrap">
                {user?.name || 'Admin User'}
              </span>
              <span className="text-xs text-secondary font-body whitespace-nowrap capitalize">
                {user?.role || 'Administrator'}
              </span>
            </div>

            {/* Dropdown Icon */}
            <Icons.chevronDown 
              size={18} 
              className={`text-secondary transition-transform duration-200 ml-2 ${
                showDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-primary/10 overflow-hidden z-20">
                {/* User Info Header */}
                <div className="px-4 py-4 bg-background border-b border-primary/10">
                  <div className="flex items-center gap-3">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-accent/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white text-lg font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-primary truncate">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-secondary truncate">{user?.email || 'admin@example.com'}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-accent/20 text-accent capitalize">
                        {user?.role || 'admin'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-secondary hover:bg-secondary/5 hover:text-secondary transition-colors flex items-center gap-3 group"
                  >
                    <Icons.logout size={18} className="text-secondary group-hover:text-secondary" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
