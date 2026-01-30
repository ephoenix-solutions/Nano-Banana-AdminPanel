import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getUserById, 
  getUsersByIds,
} from '@/lib/services/user.service';
import { User } from '@/lib/types/user.types';
import { Timestamp } from 'firebase/firestore';

interface UseUserDetailsReturn {
  loading: boolean;
  error: string | null;
  user: User | null;
  creatorUser: User | null;
  handleBack: () => void;
  handleEdit: () => void;
  handleLoginHistory: () => void;
  formatTimestamp: (timestamp: Timestamp) => string;
}

export function useUserDetails(userId: string): UseUserDetailsReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [creatorUser, setCreatorUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  useEffect(() => {
    if (user?.createdBy) {
      fetchCreatorUser();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(userId);
      if (userData) {
        setUser(userData);
      } else {
        setError('User not found');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorUser = async () => {
    try {
      if (!user?.createdBy) return;
      
      const creators = await getUsersByIds([user.createdBy]);
      if (creators.length > 0) {
        setCreatorUser(creators[0]);
      }
    } catch (err) {
      console.error('Error fetching creator user:', err);
    }
  };



  const handleBack = () => {
    router.push('/users');
  };

  const handleEdit = () => {
    router.push(`/users/edit/${userId}`);
  };

  const handleLoginHistory = () => {
    router.push(`/users/view/${userId}/login-history`);
  };

  const formatTimestamp = (timestamp: Timestamp): string => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return {
    loading,
    error,
    user,
    creatorUser,
    handleBack,
    handleEdit,
    handleLoginHistory,
    formatTimestamp,
  };
}
