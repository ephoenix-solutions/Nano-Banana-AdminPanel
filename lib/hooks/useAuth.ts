'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { loginUser, logoutUser, checkAuth, setUser } from '@/lib/store/authSlice';
import { LoginCredentials } from '@/lib/types/auth.types';
import { AuthUser } from '@/lib/types/auth.types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);

  const login = async (credentials: LoginCredentials) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      return { success: true, user: result.payload };
    } else {
      return { success: false, message: result.payload as string };
    }
  };

  const logout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  const updateUser = (newUser: AuthUser | null) => {
    dispatch(setUser(newUser));
  };

  return {
    user,
    isLoading,
    isAuth: isAuthenticated,
    error,
    login,
    logout,
    setUser: updateUser,
  };
}
