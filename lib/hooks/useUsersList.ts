import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types/user.types';
import { 
  getAllUsers, 
  softDeleteUser, 
  getUsersByIds 
} from '@/lib/services/user.service';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/shared/Toast';

export type SortField = 'name' | 'email' | 'role' | 'provider' | 'createdAt' | 'lastLogin';
export type SortOrder = 'asc' | 'desc';
export type RoleFilter = 'all' | 'admin' | 'user';
export type ProviderFilter = 'all' | 'google' | 'apple' | 'manual';

interface UseUsersListReturn {
  // Data
  users: User[];
  paginatedUsers: User[];
  userCache: Record<string, User>;
  
  // Loading states
  loading: boolean;
  
  // Filter states
  searchQuery: string;
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
  handleAddUser: () => void;
  handleView: (user: User) => void;
  handleEdit: (user: User) => void;
  handleDeleteClick: (user: User) => void;
  handleDeleteConfirm: () => Promise<void>;
  
  // Delete modal
  deleteModal: {
    isOpen: boolean;
    user: User | null;
  };
  setDeleteModal: (modal: { isOpen: boolean; user: User | null }) => void;
  
  // Utilities
  formatTimestamp: (timestamp: Timestamp) => string;
}

export function useUsersList(): UseUsersListReturn {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  
  // Data states
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('all');
  

  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  // Fetch users when filters change
  useEffect(() => {
    fetchUsers();
  }, []); // Only fetch once on mount

  // Fetch creator users when allUsers change
  useEffect(() => {
    if (allUsers.length > 0) {
      fetchCreatorUsers();
    }
  }, [allUsers]);



  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const users = await getAllUsers(false);
      
      setAllUsers(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorUsers = async () => {
    try {
      const uniqueCreatorIds = [
        ...new Set(
          allUsers
            .map(u => u.createdBy)
            .filter(Boolean) as string[]
        )
      ];
      
      if (uniqueCreatorIds.length === 0) return;
      
      const creatorUsers = await getUsersByIds(uniqueCreatorIds);
      const userMap = creatorUsers.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, User>);
      
      setUserCache(userMap);
    } catch (err) {
      console.error('Error fetching creator users:', err);
      showToast('Failed to load creator information', 'error');
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

  // Client-side filtering, sorting, and pagination
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...allUsers];
    
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
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
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
        
        case 'createdAt':
        case 'lastLogin':
          aValue = a[sortField] instanceof Timestamp ? a[sortField].toMillis() : 0;
          bValue = b[sortField] instanceof Timestamp ? b[sortField].toMillis() : 0;
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        
        default:
          return 0;
      }
    });
    
    return result;
  }, [allUsers, roleFilter, providerFilter, searchQuery, sortField, sortOrder]);

  // Return all filtered and sorted users (no pagination)
  const paginatedUsers = filteredAndSortedUsers;

  const handleAddUser = () => {
    router.push('/users/add');
  };

  const handleView = (user: User) => {
    router.push(`/users/view/${user.id}`);
  };

  const handleEdit = (user: User) => {
    router.push(`/users/edit/${user.id}`);
  };

  const handleDeleteClick = (user: User) => {
    setDeleteModal({
      isOpen: true,
      user,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user || !currentUser) return;

    try {
      await softDeleteUser(deleteModal.user.id, currentUser.id);
      setDeleteModal({ isOpen: false, user: null });
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      showToast('Failed to delete user', 'error');
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
    setSortField('name');
    setSortOrder('asc');
    setRoleFilter('all');
    setProviderFilter('all');
  };

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      roleFilter !== 'all' ||
      providerFilter !== 'all'
    );
  }, [searchQuery, roleFilter, providerFilter]);

  return {
    // Data
    users: allUsers,
    paginatedUsers,
    userCache,
    
    // Loading states
    loading,
    
    // Filter states
    searchQuery,
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
    handleAddUser,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    formatTimestamp,
  };
}
