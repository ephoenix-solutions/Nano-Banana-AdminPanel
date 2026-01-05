import { LoginCredentials, AuthResponse, AuthUser } from '@/lib/types/auth.types';

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
    
    // Note: Token is stored in HTTP-only cookie by server
    // No need to store token in client-side cookie for security
    
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
  }
  // Note: Server clears HTTP-only cookie
}

/**
 * Check if user has an active session
 * Note: This checks if the user is authenticated by calling the verify endpoint
 */
export async function hasSession(): Promise<boolean> {
  const user = await verifyToken();
  return user !== null;
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
  const user = await verifyToken();
  return user !== null;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await verifyToken();
  return user !== null && user.role === 'admin';
}

/**
 * Get current user from token
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  return await verifyToken();
}
