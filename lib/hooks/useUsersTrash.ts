import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types/user.types';
import { 
  getDeletedUsers, 
  restoreUser, 
  permanentlyDeleteUser, 
  getUsersByIds 
} from '@/lib/services/user.service';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/shared/Toast';

export type SortField = 'name' | 'email' | 'role' | 'provider' | 'deletedAt';
export type SortOrder = 'asc' | 'desc';
export type RoleFilter = 'all' | 'admin' | 'user';
export type ProviderFilter = 'all' | 'google' | 'apple' | 'manual';

interface UseUsersTrashReturn {
  // Data
  deletedUsers: User[];
  paginatedUsers: User[];
  userCache: Record<string, User>;
  
  // Loading states
  loading: boolean;
  
  // Filter states
  searchQuery: string;
  debouncedSearchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  roleFilter: RoleFilter;
  providerFilter: ProviderFilter;
  hasActiveFilters: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setRoleFilter: (role: RoleFilter) => void;
  setProviderFilter: (provider: ProviderFilter) => void;
  handleSort: (field: SortField) => void;
  clearFilters: () => void;
  
  // CRUD operations
  handleRestore: (user: User) => void;
  handlePermanentDelete: (user: User) => void;
  handleRestoreConfirm: () => Promise<void>;
  handlePermanentDeleteConfirm: () => Promise<void>;
  
  // Modal states
  restoreModal: {
    isOpen: boolean;
    user: User | null;
  };
  permanentDeleteModal: {
    isOpen: boolean;
    user: User | null;
  };
  setRestoreModal: (modal: { isOpen: boolean; user: User | null }) => void;
  setPermanentDeleteModal: (modal: { isOpen: boolean; user: User | null }) => void;
  
  // Delete progress states
  deleteProgress: Array<{ message: string; timestamp: number }>;
  isDeleting: boolean;
  
  // Utilities
  formatTimestamp: (timestamp: Timestamp) => string;
  getDeletedById: (user: User) => string | null;
  filteredAndSortedUsers: User[];
}

export function useUsersTrash(): UseUsersTrashReturn {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  
  // Data states
  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('deletedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('all');
  
  // Delete progress states
  const [deleteProgress, setDeleteProgress] = useState<Array<{ message: string; timestamp: number }>>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  

  
  // Modal states
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  const [permanentDeleteModal, setPermanentDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users when filters change
  useEffect(() => {
    fetchDeletedUsers();
  }, []); // Only fetch once on mount

  // Fetch deletedBy users when deletedUsers change
  useEffect(() => {
    if (deletedUsers.length > 0) {
      fetchDeletedByUsers();
    }
  }, [deletedUsers]);



  const fetchDeletedUsers = async () => {
    try {
      setLoading(true);
      
      const users = await getDeletedUsers();
      
      setDeletedUsers(users);
    } catch (err) {
      console.error('Error fetching deleted users:', err);
      showToast('Failed to load deleted users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedByUsers = async () => {
    try {
      const uniqueDeletedByIds = [
        ...new Set(
          deletedUsers
            .map(u => typeof u.deletedBy === 'string' ? u.deletedBy : u.deletedBy?.id)
            .filter(Boolean) as string[]
        )
      ];
      
      if (uniqueDeletedByIds.length === 0) return;
      
      const deletedByUsers = await getUsersByIds(uniqueDeletedByIds);
      const userMap = deletedByUsers.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, User>);
      
      setUserCache(userMap);
    } catch (err) {
      console.error('Error fetching deletedBy users:', err);
      showToast('Failed to load user information', 'error');
    }
  };

  const formatTimestamp = (timestamp: Timestamp): string => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date).replace(/,/g, '');
  };

  const getDeletedById = (user: User): string | null => {
    if (!user.deletedBy) return null;
    return typeof user.deletedBy === 'string' ? user.deletedBy : user.deletedBy.id;
  };

  const handleRestore = (user: User) => {
    setRestoreModal({
      isOpen: true,
      user,
    });
  };

  const handlePermanentDelete = (user: User) => {
    setPermanentDeleteModal({
      isOpen: true,
      user,
    });
  };

  const handleRestoreConfirm = async () => {
    if (!restoreModal.user) return;

    try {
      await restoreUser(restoreModal.user.id);
      setRestoreModal({ isOpen: false, user: null });
      await fetchDeletedUsers();
    } catch (err) {
      console.error('Error restoring user:', err);
      showToast('Failed to restore user', 'error');
    }
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteModal.user) return;

    try {
      setIsDeleting(true);
      setDeleteProgress([]);
      
      await permanentlyDeleteUser(permanentDeleteModal.user.id, (message) => {
        setDeleteProgress(prev => [...prev, { message, timestamp: Date.now() }]);
      });
      
      setIsDeleting(false);
      setPermanentDeleteModal({ isOpen: false, user: null });
      setDeleteProgress([]);
      await fetchDeletedUsers();
      showToast('User permanently deleted', 'success');
    } catch (err) {
      console.error('Error permanently deleting user:', err);
      setIsDeleting(false);
      showToast('Failed to permanently delete user', 'error');
      setPermanentDeleteModal({ isOpen: false, user: null });
      setDeleteProgress([]);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSortField('deletedAt');
    setSortOrder('desc');
    setRoleFilter('all');
    setProviderFilter('all');
  };

  const hasActiveFilters = useMemo(() => {
    return (
      debouncedSearchQuery.trim() !== '' ||
      roleFilter !== 'all' ||
      providerFilter !== 'all'
    );
  }, [debouncedSearchQuery, roleFilter, providerFilter]);

  // Client-side filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...deletedUsers];
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply provider filter
    if (providerFilter !== 'all') {
      if (providerFilter === 'apple') {
        result = result.filter(user => 
          user.provider === 'apple' || user.provider === 'ios'
        );
      } else {
        result = result.filter(user => user.provider === providerFilter);
      }
    }
    
    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
        case 'email':
        case 'role':
        case 'provider':
          aValue = (a[sortField] || '').toLowerCase();
          bValue = (b[sortField] || '').toLowerCase();
          const comparison = aValue.localeCompare(bValue);
          return sortOrder === 'asc' ? comparison : -comparison;
        
        case 'deletedAt':
          aValue = a.deletedAt instanceof Timestamp ? a.deletedAt.toMillis() : 0;
          bValue = b.deletedAt instanceof Timestamp ? b.deletedAt.toMillis() : 0;
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        
        default:
          return 0;
      }
    });
    
    return result;
  }, [deletedUsers, roleFilter, providerFilter, debouncedSearchQuery, sortField, sortOrder]);

  // Return all filtered and sorted users (no pagination)
  const paginatedUsers = filteredAndSortedUsers;

  return {
    // Data
    deletedUsers,
    paginatedUsers,
    userCache,
    
    // Loading states
    loading,
    
    // Filter states
    searchQuery,
    debouncedSearchQuery,
    sortField,
    sortOrder,
    roleFilter,
    providerFilter,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setSortField,
    setSortOrder,
    setRoleFilter,
    setProviderFilter,
    handleSort,
    clearFilters,
    
    // CRUD operations
    handleRestore,
    handlePermanentDelete,
    handleRestoreConfirm,
    handlePermanentDeleteConfirm,
    
    // Modal states
    restoreModal,
    permanentDeleteModal,
    setRestoreModal,
    setPermanentDeleteModal,
    
    // Delete progress states
    deleteProgress,
    isDeleting,
    
    // Utilities
    formatTimestamp,
    getDeletedById,
    filteredAndSortedUsers,
  };
}
