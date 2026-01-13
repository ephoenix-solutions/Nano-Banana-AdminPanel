'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Icons } from '@/config/icons';

interface SearchItem {
  id: string;
  label: string;
  href: string;
  icon?: any;
  category: string;
}

const searchItems: SearchItem[] = [
  // Dashboard
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: Icons.home, category: 'Main Menu' },

  // Profile 
  { id: 'my-profile', label: 'My Profile', href: '/profile', icon: Icons.user, category: 'Main Menu' },
  
  // Users
  { id: 'users', label: 'Users', href: '/users', icon: Icons.users, category: 'Main Menu' },
  { id: 'add-user', label: 'Add User', href: '/users/add', icon: Icons.cornerDownRight, category: 'Users' },
  
  // Categories
  { id: 'categories', label: 'Categories', href: '/categories', icon: Icons.categories, category: 'Main Menu' },
  { id: 'add-category', label: 'Add Category', href: '/categories/add', icon: Icons.cornerDownRight, category: 'Categories' },
  
  // Prompts
  { id: 'prompts', label: 'Prompts', href: '/prompts', icon: Icons.images, category: 'Main Menu' },
  { id: 'add-prompt', label: 'Add Prompt', href: '/prompts/add', icon: Icons.cornerDownRight, category: 'Prompts' },
  { id: 'import-prompts', label: 'Import Prompts', href: '/prompts/import', icon: Icons.cornerDownRight , category: 'Prompts' },
  
  // Countries
  { id: 'countries', label: 'Countries', href: '/countries', icon: Icons.globe, category: 'Main Menu' },
  
  // Subscription Plan
  { id: 'subscription_plan', label: 'Subscription Plan', href: '/subscription-plan', icon: Icons.subscriptionPlan, category: 'Main Menu' },
  
  // User Subscription
  { id: 'user_subscription', label: 'User Subscription', href: '/user-subscription', icon: Icons.userSubscription, category: 'Main Menu' },
  
  // Feedback
  { id: 'feedback', label: 'Feedback', href: '/feedback', icon: Icons.feedback, category: 'Main Menu' },
  
  // User Generations
  { id: 'user_generations', label: 'User Generations', href: '/user-generations', icon: Icons.images, category: 'Main Menu' },
  
  // App Settings
  { id: 'app_settings', label: 'App Settings', href: '/app-settings', icon: Icons.appSettings, category: 'Main Menu' },
  
  // Developer Guide
  { id: 'developer_guide', label: 'Developer Guide', href: '/developer-guide', icon: Icons.file, category: 'Main Menu' },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms delay

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Filter search results
  const filteredResults = useMemo(() => {
    if (!debouncedQuery.trim()) return searchItems;
    
    const query = debouncedQuery.toLowerCase();
    const matchedItems = new Set<string>();
    const results: SearchItem[] = [];
    let firstMatchIndex = -1;
    
    searchItems.forEach((item, index) => {
      const matches = item.label.toLowerCase().includes(query) ||
                     item.category.toLowerCase().includes(query);
      
      if (matches) {
        matchedItems.add(item.id);
        
        // If this is a sub-item, also include its parent
        if (item.category !== 'Main Menu') {
          // Find parent item (the item right before this sub-item)
          for (let i = index - 1; i >= 0; i--) {
            if (searchItems[i].category === 'Main Menu') {
              if (!matchedItems.has(searchItems[i].id)) {
                matchedItems.add(searchItems[i].id);
                results.push(searchItems[i]);
              }
              break;
            }
          }
        }
        
        // Track the first actual match (not parent)
        if (firstMatchIndex === -1) {
          firstMatchIndex = results.length;
        }
        
        results.push(item);
      }
    });
    
    // Set selected index to first actual match
    if (firstMatchIndex !== -1 && debouncedQuery.trim()) {
      setTimeout(() => setSelectedIndex(firstMatchIndex), 0);
    }
    
    return results;
  }, [debouncedQuery]);

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-accent/30 text-primary font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setDebouncedQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSelectedIndex(0);
    }
  }, [debouncedQuery]);

  // Scroll selected item into view with proper timing and visibility checking
  useEffect(() => {
    if (!isOpen) return;

    // Cancel any pending scroll operations
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    // Use requestAnimationFrame to ensure DOM is ready
    scrollRafRef.current = requestAnimationFrame(() => {
      if (!resultsRef.current) return;

      const container = resultsRef.current;
      const selectedElement = container.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;

      if (!selectedElement) return;

      // Get positions relative to viewport
      const containerRect = container.getBoundingClientRect();
      const elementRect = selectedElement.getBoundingClientRect();

      // Calculate if element is out of view
      const isAboveView = elementRect.top < containerRect.top;
      const isBelowView = elementRect.bottom > containerRect.bottom;
      
      // Scroll if element is out of view
      if (isAboveView) {
        // Element is above viewport - scroll up
        // Calculate how much to scroll: current scroll + difference between tops
        const scrollAdjustment = elementRect.top - containerRect.top;
        container.scrollTop += scrollAdjustment - 8; // 8px padding from top
      } else if (isBelowView) {
        // Element is below viewport - scroll down
        // Calculate how much to scroll: current scroll + difference between bottoms
        const scrollAdjustment = elementRect.bottom - containerRect.bottom;
        container.scrollTop += scrollAdjustment + 8; // 8px padding from bottom
      }
      // If element is visible, don't scroll
    });

    // Cleanup function
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [selectedIndex, isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleNavigate(filteredResults[selectedIndex].href);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  if (!isOpen) return null;

  // Use portal to render outside of Header's stacking context
  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1500]"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="fixed inset-0 z-[1501] flex items-start justify-center pt-[10vh] px-4 ">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[70vh] flex flex-col overflow-hidden pointer-events-auto">
          {/* Search Input */}
          <div className="p-4 border-b border-primary/10">
            <div className="relative">
              <Icons.search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full pl-12 pr-4 py-3 text-base font-body text-primary bg-background rounded-lg border border-primary/10 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-semibold text-secondary bg-background border border-primary/20 rounded">
                  ESC
                </kbd>
              </div>
            </div>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="flex-1 overflow-y-auto p-2">
            {filteredResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icons.search size={48} className="text-secondary/30 mb-4" />
                <p className="text-sm text-secondary font-body">No results found</p>
                <p className="text-xs text-secondary/70 font-body mt-1">
                  Try searching with different keywords
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredResults.map((item, index) => {
                  const IconComponent = item.icon;
                  const isSelected = index === selectedIndex;
                  
                  const isSubItem = item.category !== 'Main Menu';
                  
                  return (
                    <button
                      key={item.id}
                      data-index={index}
                      onClick={() => handleNavigate(item.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 py-3 rounded-lg text-left transition-all ${
                        isSubItem ? 'pl-12 pr-4' : 'px-4'
                      } ${
                        isSelected
                          ? 'bg-accent text-primary'
                          : 'hover:bg-background text-primary'
                      }`}
                    >
                      {IconComponent && (
                        <IconComponent 
                          size={isSubItem ? 16 : 20} 
                          className={isSelected ? 'text-primary' : 'text-secondary'} 
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-body ${
                          isSubItem ? 'text-xs' : 'text-sm'
                        } ${
                          isSubItem ? 'font-normal' : 'font-medium'
                        } ${
                          isSelected ? 'text-primary' : 'text-primary'
                        }`}>
                          {highlightText(item.label, debouncedQuery)}
                        </p>
                        {!isSubItem && (
                          <p className={`text-xs font-body ${
                            isSelected ? 'text-primary/70' : 'text-secondary'
                          }`}>
                            {item.category}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <kbd className="px-2 py-1 text-xs font-semibold text-primary bg-white/20 border border-primary/20 rounded">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-primary/10 bg-background">
            <div className="flex items-center justify-between text-xs text-secondary font-body">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-primary/20 rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border border-primary/20 rounded">↓</kbd>
                  <span className="ml-1">Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-primary/20 rounded">↵</kbd>
                  <span className="ml-1">Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-primary/20 rounded">ESC</kbd>
                <span className="ml-1">Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
