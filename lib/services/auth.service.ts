import Cookies from 'js-cookie';
import { LoginCredentials, AuthResponse, AuthUser } from '@/lib/types/auth.types';

const COOKIE_NAME = 'admin_token_client'; // Client-readable cookie

/**
 * Login user with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (data.success && data.token) {
      // Store token in cookie (client-side backup)
      Cookies.set(COOKIE_NAME, data.token, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login',
    };
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear both cookies
    Cookies.remove(COOKIE_NAME);
    Cookies.remove('admin_token');
  }
}

/**
 * Get current auth token
 */
export function getToken(): string | undefined {
  return Cookies.get(COOKIE_NAME);
}

/**
 * Verify JWT token
 */
export async function verifyToken(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/verify');
    const data = await response.json();
    
    if (data.success && data.user) {
      return data.user;
    }
    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  
  const user = await verifyToken();
  return user !== null;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  
  const user = await verifyToken();
  return user !== null && user.role === 'admin';
}

/**
 * Get current user from token
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  
  return await verifyToken();
}
