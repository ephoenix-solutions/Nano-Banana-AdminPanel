'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '@/config/icons';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant: 'default' | 'success' | 'warning' | 'danger';
  duration?: number;
  icon?: ReactNode;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return {
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
      const variant = type === 'error' ? 'danger' : type === 'info' ? 'default' : type;
      context.addToast({
        title: message,
        variant: variant as 'default' | 'success' | 'warning' | 'danger',
      });
    },
    toast: context,
  };
};

interface ToastProviderProps {
  children: ReactNode;
  maxVisibleToasts?: number;
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const MAX_VISIBLE_TOASTS = 5;

export function ToastProvider({ 
  children, 
  maxVisibleToasts = MAX_VISIBLE_TOASTS,
  placement = 'top-right' 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutsRef = useRef<Map<string, { timeoutId: NodeJS.Timeout; remainingTime: number; startTime: number }>>(new Map());
  const toastRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxVisibleToasts);
    });

    // Set up auto remove
    if (newToast.duration && newToast.duration > 0) {
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, newToast.duration);

      timeoutsRef.current.set(id, {
        timeoutId,
        remainingTime: newToast.duration,
        startTime: Date.now(),
      });
    }

    return id;
  }, [maxVisibleToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    
    // Clear timeout
    const timeoutData = timeoutsRef.current.get(id);
    if (timeoutData) {
      clearTimeout(timeoutData.timeoutId);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
    // Clear all timeouts
    timeoutsRef.current.forEach((data) => clearTimeout(data.timeoutId));
    timeoutsRef.current.clear();
  }, []);

  // Handle hover - pause all timers
  useEffect(() => {
    if (isHovered) {
      // Pause all timers
      timeoutsRef.current.forEach((data, id) => {
        clearTimeout(data.timeoutId);
        const elapsed = Date.now() - data.startTime;
        const remaining = Math.max(0, data.remainingTime - elapsed);
        timeoutsRef.current.set(id, {
          ...data,
          remainingTime: remaining,
        });
      });
    } else {
      // Resume all timers
      timeoutsRef.current.forEach((data, id) => {
        if (data.remainingTime > 0) {
          const timeoutId = setTimeout(() => {
            removeToast(id);
          }, data.remainingTime);
          
          timeoutsRef.current.set(id, {
            timeoutId,
            remainingTime: data.remainingTime,
            startTime: Date.now(),
          });
        }
      });
    }
  }, [isHovered, removeToast]);

  const getVariantStyles = (variant: Toast['variant']) => {
    switch (variant) {
      case 'success':
        return 'bg-[#fffbeb] text-primary';
      case 'danger':
        return 'bg-[#fdf5f3] text-primary';
      case 'warning':
        return 'bg-[#fffbeb] text-primary';
      default:
        return 'bg-white text-primary';
    }
  };

  const getVariantIcon = (variant: Toast['variant']) => {
    switch (variant) {
      case 'success':
        return <Icons.check size={20} style={{ color: '#FFB22C' }} />;
      case 'danger':
        return <Icons.alert size={20} style={{ color: '#854836' }} />;
      case 'warning':
        return <Icons.alert size={20} style={{ color: '#FFB22C' }} />;
      default:
        return <Icons.info size={20} style={{ color: '#000000' }} />;
    }
  };

  const getPositionClasses = () => {
    switch (placement) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  // Reverse toasts for display so newest is on top visually
  const displayToasts = [...toasts].reverse();

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      
      {/* Toast Container */}
      <div className={`fixed ${getPositionClasses()} z-[99999] pointer-events-none`}>
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence>
            {displayToasts.map((toast, index) => {
              // Calculate 3D stacking effect
              // index 0 = oldest (back), last index = newest (front)
              const reverseIndex = displayToasts.length - 1 - index;
              
              // Get the actual height of the current toast
              const toastElement = toastRefs.current.get(toast.id);
              const toastHeight = toastElement ? toastElement.offsetHeight : 70; // Default 70px if not measured
              
              // Calculate cumulative height for proper spacing
              let cumulativeHeight = 0;
              if (isHovered) {
                for (let i = displayToasts.length - 1; i > index; i--) {
                  const prevToast = displayToasts[i];
                  const prevElement = toastRefs.current.get(prevToast.id);
                  const prevHeight = prevElement ? prevElement.offsetHeight : 70;
                  cumulativeHeight += prevHeight + 12; // 12px gap between toasts
                }
              }
              
              const scale = isHovered ? 1 : (1 - (reverseIndex * 0.05)); // Full size on hover
              const translateY = isHovered ? cumulativeHeight : (reverseIndex * 8); // Dynamic spacing on hover
              const opacity = isHovered ? 1 : (1 - (reverseIndex * 0.15)); // Full opacity on hover
              const zIndex = index + 1; // Oldest has lowest z-index, newest has highest

              return (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: -20, x: 100, scale: 0.9 }}
                  animate={{ 
                    opacity: opacity, 
                    y: translateY, 
                    x: 0,
                    scale: scale,
                  }}
                  exit={{ opacity: 0, x: 100, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{
                    position: index === displayToasts.length - 1 ? 'relative' : 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: zIndex,
                  }}
                  className="pointer-events-auto"
                >
                  <div
                    ref={(el) => {
                      if (el) {
                        toastRefs.current.set(toast.id, el);
                      }
                    }}
                    className={`flex items-start gap-3 min-w-[320px] max-w-[420px] p-4 rounded-lg shadow-lg transition-shadow duration-300 ${
                      isHovered ? 'shadow-xl' : ''
                    } ${getVariantStyles(toast.variant)}`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {toast.icon || getVariantIcon(toast.variant)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {toast.title && (
                        <div className="text-sm font-semibold font-body mb-1">
                          {toast.title}
                        </div>
                      )}
                      {toast.description && (
                        <div className="text-xs font-body opacity-80">
                          {toast.description}
                        </div>
                      )}
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => removeToast(toast.id)}
                      className="flex-shrink-0 hover:opacity-70 transition-opacity"
                      aria-label="Close"
                    >
                      <Icons.close size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
