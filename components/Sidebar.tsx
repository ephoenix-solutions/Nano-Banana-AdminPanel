'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/config/icons';
import { LucideIcon } from 'lucide-react';

interface SubMenuItem {
  id: string;
  label: string;
  href: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Icons.home, 
    href: '/',
  },
  { 
    id: 'profile', 
    label: 'My Profile', 
    icon: Icons.user, 
    href: '/profile',
  },
  { 
    id: 'users', 
    label: 'Users', 
    icon: Icons.users, 
    href: '/users',
    subItems: [
      { id: 'add-user', label: 'Add User', href: '/users/add' },
    ]
  },
  { 
    id: 'categories', 
    label: 'Categories', 
    icon: Icons.categories, 
    href: '/categories',
    subItems: [
      { id: 'add-category', label: 'Add Category', href: '/categories/add' },
    ]
  },
  { 
    id: 'prompts', 
    label: 'Prompts', 
    icon: Icons.images, 
    href: '/prompts',
    subItems: [
      { id: 'add-prompt', label: 'Add Prompt', href: '/prompts/add' },
    ]
  },
  { id: 'countries', label: 'Countries', icon: Icons.globe, href: '/countries' },
  { id: 'subscription_plan', label: 'Subscription Plan', icon: Icons.subscriptionPlan, href: '/subscription-plan' },
  { id: 'user_subscription', label: 'User Subscription', icon: Icons.userSubscription, href: '/user-subscription' },
  { id: 'feedback', label: 'Feedback', icon: Icons.feedback, href: '/feedback' },
  { id: 'app_settings', label: 'App Settings', icon: Icons.appSettings, href: '/app-settings' },
  { id: 'developer_guide', label: 'Developer Guide', icon: Icons.file, href: '/developer-guide' },
];

interface SidebarProps {
  onWidthChange?: (width: number) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ onWidthChange, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  // Initialize from localStorage to persist across page navigations
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved === 'true';
    }
    return false;
  });
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  // Save collapse state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }
    onWidthChange?.(isCollapsed ? 80 : 280);
    // Close all dropdowns when collapsing sidebar
    if (isCollapsed) {
      setOpenDropdowns([]);
    }
  }, [isCollapsed, onWidthChange]);

  // Initialize and maintain open dropdowns based on current path
  useEffect(() => {
    // Don't auto-open dropdowns when sidebar is collapsed
    if (isCollapsed) return;
    
    const shouldBeOpen: string[] = [];
    
    menuItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        // Check if current path matches main item or any sub-item
        const isMainPath = pathname === item.href;
        const hasActiveSubItem = item.subItems.some(
          (subItem) => pathname === subItem.href
        );
        
        if (isMainPath || hasActiveSubItem) {
          shouldBeOpen.push(item.id);
        }
      }
    });

    // Set dropdowns without merging - just use what should be open
    setOpenDropdowns(shouldBeOpen);
  }, [pathname, isCollapsed]);

  const toggleDropdown = (itemId: string) => {
    // Don't toggle dropdowns when sidebar is collapsed
    if (isCollapsed) return;
    
    setOpenDropdowns((prev) => {
      if (prev.includes(itemId)) {
        // Remove from array
        return prev.filter(id => id !== itemId);
      } else {
        // Add to array
        return [...prev, itemId];
      }
    });
  };

  const isDropdownOpen = (itemId: string) => {
    return openDropdowns.includes(itemId);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-primary flex flex-col z-[1000] transition-all duration-300 overflow-x-hidden
          ${
            isCollapsed ? 'w-20' : 'w-[280px]'
          }
          ${
            // Mobile: slide in/out from left
            isMobileOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >
      {/* Logo Section */}
      <div className={`px-6 py-5 border-b border-accent/20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-primary text-base font-bold flex-shrink-0">
            NB
          </div>
          {!isCollapsed && (
            <h1 className="text-accent text-xl font-bold font-heading whitespace-nowrap">
              Nano Banana
            </h1>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
        <ul className="flex flex-col gap-2 px-3">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const dropdownOpen = isDropdownOpen(item.id);
            
            return (
              <li key={item.id}>
                {/* Main Menu Item */}
                <div className="relative group">
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200
                      font-body text-sm
                      ${isCollapsed ? 'justify-center' : 'justify-start'}
                      ${
                        isActive
                          ? 'bg-accent text-primary font-semibold shadow-sm'
                          : 'text-background hover:bg-secondary/50 font-medium'
                      }
                    `}
                  >
                    <IconComponent size={20} strokeWidth={2} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="whitespace-nowrap flex-1">{item.label}</span>
                        {hasSubItems && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleDropdown(item.id);
                            }}
                            className="p-1 hover:bg-primary/10 rounded transition-colors"
                          >
                            <Icons.chevronDown
                              size={16}
                              className={`transition-transform duration-200 ${
                                dropdownOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </>
                    )}
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-primary text-background text-sm font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.label}
                      {hasSubItems && (
                        <div className="mt-2 pt-2 border-t border-accent/20 space-y-1">
                          {item.subItems!.map((subItem) => (
                            <Link
                              key={subItem.id}
                              href={subItem.href}
                              className="block px-2 py-1 hover:bg-accent/20 rounded text-xs"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dropdown Sub-items */}
                {hasSubItems && !isCollapsed && dropdownOpen && (
                  <ul className="mt-1 ml-4 pl-4 border-l-2 border-accent/30 space-y-1">
                    {item.subItems!.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <li key={subItem.id}>
                          <Link
                            href={subItem.href}
                            className={`
                              flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200
                              font-body text-sm
                              ${
                                isSubActive
                                  ? 'bg-accent/80 text-primary font-semibold'
                                  : 'text-background/80 hover:bg-secondary/30 font-normal'
                              }
                            `}
                          >
                            <Icons.chevronRight size={14} strokeWidth={2} className="flex-shrink-0" />
                            <span className="whitespace-nowrap">{subItem.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button - Hidden on mobile */}
      <div className="hidden lg:block p-4 border-t border-accent/20">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 py-3 bg-secondary text-background rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-primary flex items-center justify-center gap-2 font-body"
        >
          {isCollapsed ? (
            <Icons.chevronRight size={18} strokeWidth={2} />
          ) : (
            <>
              <Icons.chevronLeft size={18} strokeWidth={2} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Close Button - Mobile only */}
      <div className="lg:hidden p-4 border-t border-accent/20">
        <button
          onClick={onMobileClose}
          className="w-full px-4 py-3 bg-secondary text-background rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-primary flex items-center justify-center gap-2 font-body"
        >
          <Icons.close size={18} strokeWidth={2} />
          <span>Close Menu</span>
        </button>
      </div>
    </aside>
    </>
  );
}
