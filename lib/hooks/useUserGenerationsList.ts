import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserGeneration } from '@/lib/types/user-generation.types';
import { User } from '@/lib/types/user.types';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';
import {
  getAllUserGenerations,
  deleteUserGeneration,
  getUserGenerationStats,
} from '@/lib/services/user-generation.service';
import { getUsersByIds } from '@/lib/services/user.service';
import { getAllSubscriptionPlans } from '@/lib/services/subscription-plan.service';

export type SortField = 'createdAt' | 'userId' | 'promptText' | 'generationStatus';
export type SortOrder = 'asc' | 'desc';
export type StatusFilter = 'all' | 'pending' | 'success' | 'failed';

interface UseUserGenerationsListReturn {
  // Data
  generations: UserGeneration[];
  filteredAndSortedGenerations: UserGeneration[];
  userCache: Record<string, User>;
  planCache: Record<string, SubscriptionPlan>;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Filter states
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  statusFilter: StatusFilter;
  userFilter: string;
  hasActiveFilters: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setUserFilter: (userId: string) => void;
  handleSort: (field: SortField) => void;
  clearFilters: () => void;
  
  // CRUD operations
  handleView: (generation: UserGeneration) => void;
  handleDeleteClick: (generation: UserGeneration) => void;
  handleDeleteConfirm: () => Promise<void>;
  
  // Delete modal
  deleteModal: {
    isOpen: boolean;
    generation: UserGeneration | null;
  };
  setDeleteModal: (modal: { isOpen: boolean; generation: UserGeneration | null }) => void;
  
  // Utilities
  formatTimestamp: (timestamp: any) => string | null;
  getStatusColor: (status: string) => string;
  getStatusBadge: (status: string) => string;
}

export function useUserGenerationsList(): UseUserGenerationsListReturn {
  const router = useRouter();
  
  // Data states
  const [generations, setGenerations] = useState<UserGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const [planCache, setPlanCache] = useState<Record<string, SubscriptionPlan>>({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    generation: UserGeneration | null;
  }>({
    isOpen: false,
    generation: null,
  });

  // Fetch initial data
  useEffect(() => {
    fetchGenerations();
  }, []);

  // Fetch users and plans when generations change
  useEffect(() => {
    if (generations.length > 0) {
      fetchUsersAndPlans();
    }
  }, [generations]);

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUserGenerations();
      setGenerations(data);
    } catch (err) {
      console.error('Error fetching generations:', err);
      setError('Failed to load user generations');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndPlans = async () => {
    try {
      // Fetch unique users
      const uniqueUserIds = [...new Set(generations.map(g => g.userId))];
      const users = await getUsersByIds(uniqueUserIds);
      const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, User>);
      setUserCache(userMap);

      // Fetch unique plans
      const uniquePlanIds = [...new Set(generations.map(g => g.planId).filter(Boolean) as string[])];
      if (uniquePlanIds.length > 0) {
        const plans = await getAllSubscriptionPlans();
        const planMap = plans.reduce((acc, plan) => {
          acc[plan.id] = plan;
          return acc;
        }, {} as Record<string, SubscriptionPlan>);
        setPlanCache(planMap);
      }
    } catch (err) {
      console.error('Error fetching users and plans:', err);
    }
  };

  const formatTimestamp = (timestamp: any): string | null => {
    if (!timestamp) return null;
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date).replace(/,/g, '');
    } catch (error) {
      return null;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  // Navigation handlers
  const handleView = (generation: UserGeneration) => {
    router.push(`/user-generations/view/${generation.id}`);
  };

  const handleDeleteClick = (generation: UserGeneration) => {
    setDeleteModal({
      isOpen: true,
      generation,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.generation) return;

    try {
      await deleteUserGeneration(deleteModal.generation.id);
      setDeleteModal({ isOpen: false, generation: null });
      await fetchGenerations();
    } catch (err) {
      console.error('Error deleting generation:', err);
      setError('Failed to delete generation');
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

  // Filter and Sort Generations
  const filteredAndSortedGenerations = useMemo(() => {
    let filtered = [...generations];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((gen) => {
        const user = userCache[gen.userId];
        return (
          gen.promptText.toLowerCase().includes(query) ||
          user?.name.toLowerCase().includes(query) ||
          user?.email.toLowerCase().includes(query) ||
          gen.id.toLowerCase().includes(query)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((gen) => gen.generationStatus === statusFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter((gen) => gen.userId === userFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'createdAt':
          aValue = a.createdAt?.toDate().getTime() || 0;
          bValue = b.createdAt?.toDate().getTime() || 0;
          break;
        case 'userId':
          aValue = (userCache[a.userId]?.name || '').toLowerCase();
          bValue = (userCache[b.userId]?.name || '').toLowerCase();
          break;
        case 'promptText':
          aValue = (a.promptText || '').toLowerCase();
          bValue = (b.promptText || '').toLowerCase();
          break;
        case 'generationStatus':
          aValue = a.generationStatus || '';
          bValue = b.generationStatus || '';
          break;
        default:
          aValue = a.createdAt?.toDate().getTime() || 0;
          bValue = b.createdAt?.toDate().getTime() || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [generations, searchQuery, sortField, sortOrder, statusFilter, userFilter, userCache]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('createdAt');
    setSortOrder('desc');
    setStatusFilter('all');
    setUserFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      statusFilter !== 'all' ||
      userFilter !== 'all'
    );
  }, [searchQuery, statusFilter, userFilter]);

  return {
    // Data
    generations,
    filteredAndSortedGenerations,
    userCache,
    planCache,
    
    // Loading states
    loading,
    error,
    
    // Filter states
    searchQuery,
    sortField,
    sortOrder,
    statusFilter,
    userFilter,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setSortField,
    setSortOrder,
    setStatusFilter,
    setUserFilter,
    handleSort,
    clearFilters,
    
    // CRUD operations
    handleView,
    handleDeleteClick,
    handleDeleteConfirm,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    formatTimestamp,
    getStatusColor,
    getStatusBadge,
  };
}
