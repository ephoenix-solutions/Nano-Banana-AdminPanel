'use client';

import { useState, useEffect, useMemo } from 'react';
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
      { id: 'import-prompts', label: 'Import Prompts', href: '/prompts/import' },
    ]
  },
  { id: 'user_generations', label: 'User Generations', icon: Icons.images, href: '/user-generations' },
  { id: 'devices', label: 'Devices', icon: Icons.smartphone, href: '/devices' },
  { id: 'countries', label: 'Countries', icon: Icons.globe, href: '/countries' },
  { id: 'subscription_plan', label: 'Subscription Plan', icon: Icons.subscriptionPlan, href: '/subscription-plan' },
  { id: 'user_subscription', label: 'User Subscription', icon: Icons.userSubscription, href: '/user-subscription' },
  { id: 'feedback', label: 'Feedback', icon: Icons.feedback, href: '/feedback' },
  { 
    id: 'app_settings', 
    label: 'App Settings', 
    icon: Icons.appSettings, 
    href: '/app-settings',
    subItems: [
      { id: 'app-settings-activity', label: 'Activity Log', href: '/app-settings-activity' },
    ]
  },
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
  // State for manual user toggles only
  const [manualToggles, setManualToggles] = useState<Record<string, boolean>>({});

  // Save collapse state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }
    onWidthChange?.(isCollapsed ? 80 : 280);
    // Clear manual toggles when collapsing sidebar
    if (isCollapsed) {
      setManualToggles({});
    }
  }, [isCollapsed, onWidthChange]);

  // Calculate which dropdowns should be auto-opened based on current path (synchronous, during render)
  const autoOpenDropdowns = useMemo(() => {
    if (isCollapsed) return new Set<string>();
    
    const shouldBeOpen = new Set<string>();
    
    menuItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const isMainPath = pathname === item.href;
        const isUnderMainPath = pathname.startsWith(item.href + '/');
        const hasActiveSubItem = item.subItems.some(
          (subItem) => pathname === subItem.href || pathname.startsWith(subItem.href + '/')
        );
        
        if (isMainPath || isUnderMainPath || hasActiveSubItem) {
          shouldBeOpen.add(item.id);
        }
      }
    });
    
    return shouldBeOpen;
  }, [pathname, isCollapsed]);

  const toggleDropdown = (itemId: string) => {
    if (isCollapsed) return;
    
    setManualToggles((prev) => {
      const currentState = prev[itemId] !== undefined ? prev[itemId] : autoOpenDropdowns.has(itemId);
      const willBeOpen = !currentState;
      
      if (willBeOpen) {
        // Opening this dropdown: close all others by setting them to false
        const newToggles: Record<string, boolean> = {};
        
        // Explicitly close all menu items that have subItems
        menuItems.forEach((item) => {
          if (item.subItems && item.subItems.length > 0 && item.id !== itemId) {
            newToggles[item.id] = false;
          }
        });
        
        // Open the clicked one
        newToggles[itemId] = true;
        return newToggles;
      } else {
        // Closing this dropdown
        return {
          ...prev,
          [itemId]: false,
        };
      }
    });
  };

  const isDropdownOpen = (itemId: string) => {
    // If manually toggled, use that state
    if (manualToggles[itemId] !== undefined) {
      return manualToggles[itemId];
    }
    // Otherwise, use auto-open logic
    return autoOpenDropdowns.has(itemId);
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
      <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden sidebar-scroll">
        <ul className="flex flex-col gap-2 px-3">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            
            // Check if any sub-item matches the current path
            const hasMatchingSubItem = item.subItems?.some(
              (subItem) => pathname === subItem.href || pathname.startsWith(subItem.href + '/')
            );
            
            // Only highlight root if:
            // 1. Exact match OR
            // 2. Path starts with item.href AND no sub-item matches
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href + '/') && !hasMatchingSubItem);
            
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const dropdownOpen = isDropdownOpen(item.id);
            
            return (
              <li key={item.id}>
                {/* Main Menu Item */}
                <div className="relative group">
                  <div
                    className={`
                      flex items-center gap-3 rounded-lg transition-all duration-200
                      font-body text-sm
                      ${isCollapsed ? 'justify-center' : 'justify-start'}
                      ${
                        isActive
                          ? 'bg-accent text-primary font-semibold shadow-sm'
                          : 'text-background hover:bg-secondary/50 font-medium'
                      }
                    `}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 flex-1 min-w-0 px-4 py-3.5"
                    >
                      <IconComponent size={20} strokeWidth={2} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="whitespace-nowrap flex-1">{item.label}</span>
                      )}
                    </Link>
                    {!isCollapsed && hasSubItems && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleDropdown(item.id);
                        }}
                        className="p-1 hover:bg-primary/10 rounded transition-colors flex-shrink-0 mr-3"
                        aria-label={`Toggle ${item.label} submenu`}
                      >
                        <Icons.chevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            dropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  
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
                      // Check if current path matches or starts with the sub-item's path
                      const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
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
                            <Icons.cornerDownRight size={14} strokeWidth={2} className="flex-shrink-0" />
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
