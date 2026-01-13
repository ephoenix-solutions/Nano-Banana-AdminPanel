import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types/user.types';
import { getAllUsers, deleteUser, getUsersByIds } from '@/lib/services/user.service';
import { Timestamp } from 'firebase/firestore';

export type SortField = 'name' | 'email' | 'role' | 'provider' | 'createdAt' | 'lastLogin';
export type SortOrder = 'asc' | 'desc';
export type RoleFilter = 'all' | 'admin' | 'user';
export type ProviderFilter = 'all' | 'google' | 'apple' | 'manual';

interface UseUsersListReturn {
  // Data
  users: User[];
  filteredAndSortedUsers: User[];
  userCache: Record<string, User>;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
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
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all creator users when users change
  useEffect(() => {
    if (users.length > 0) {
      fetchCreatorUsers();
    }
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all unique creator users to display who created each user
  const fetchCreatorUsers = async () => {
    try {
      const uniqueCreatorIds = [
        ...new Set(
          users
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

  // Navigation handlers
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
    if (!deleteModal.user) return;

    try {
      await deleteUser(deleteModal.user.id);
      setDeleteModal({ isOpen: false, user: null });
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and Sort Users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter (name or email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Provider filter
    if (providerFilter !== 'all') {
      filtered = filtered.filter((user) => {
        if (providerFilter === 'apple') {
          return user.provider === 'apple' || user.provider === 'ios';
        }
        return user.provider === providerFilter;
      });
    }

    // Sort by selected field
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'role':
          aValue = (a.role || 'user').toLowerCase();
          bValue = (b.role || 'user').toLowerCase();
          break;
        case 'provider':
          aValue = (a.provider || '').toLowerCase();
          bValue = (b.provider || '').toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt?.toMillis() || 0;
          bValue = b.createdAt?.toMillis() || 0;
          break;
        case 'lastLogin':
          aValue = a.lastLogin?.toMillis() || 0;
          bValue = b.lastLogin?.toMillis() || 0;
          break;
        default:
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchQuery, sortField, sortOrder, roleFilter, providerFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('name');
    setSortOrder('asc');
    setRoleFilter('all');
    setProviderFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      roleFilter !== 'all' ||
      providerFilter !== 'all'
    );
  }, [searchQuery, roleFilter, providerFilter]);

  return {
    // Data
    users,
    filteredAndSortedUsers,
    userCache,
    
    // Loading states
    loading,
    error,
    
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
