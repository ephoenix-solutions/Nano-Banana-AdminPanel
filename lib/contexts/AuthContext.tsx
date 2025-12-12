'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/types/auth.types';
import { 
  isAuthenticated, 
  isAdmin, 
  getCurrentUser, 
  logout as logoutService 
} from '@/lib/services/auth.service';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuth: boolean;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Custom setUser that also updates sessionStorage
  const updateUser = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (newUser) {
      sessionStorage.setItem('user', JSON.stringify(newUser));
    } else {
      sessionStorage.removeItem('user');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First, try to get user from sessionStorage for instant load
      const cachedUser = sessionStorage.getItem('user');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          console.error('Error parsing cached user:', e);
        }
      }

      // Then verify with server
      const isAuth = await isAuthenticated();
      const hasAdminRole = await isAdmin();
      
      if (isAuth && hasAdminRole) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        // Cache user in sessionStorage
        if (currentUser) {
          sessionStorage.setItem('user', JSON.stringify(currentUser));
        }
      } else {
        setUser(null);
        sessionStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      sessionStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuth: user !== null,
        logout,
        setUser: updateUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
