import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Feedback } from '@/lib/types/feedback.types';
import { User } from '@/lib/types/user.types';
import { getAllFeedback, deleteFeedback } from '@/lib/services/feedback.service';
import { getUsersByIds } from '@/lib/services/user.service';

export type SortField = 'user' | 'rating' | 'createdAt';
export type SortOrder = 'asc' | 'desc';
export type RatingFilter = 'all' | '1' | '2' | '3' | '4' | '5';

interface UseFeedbackListReturn {
  // Data
  feedback: Feedback[];
  filteredAndSortedFeedback: Feedback[];
  userCache: Record<string, User>;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Filter states
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  ratingFilter: RatingFilter;
  hasActiveFilters: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setRatingFilter: (filter: RatingFilter) => void;
  handleSort: (field: SortField) => void;
  clearFilters: () => void;
  
  // CRUD operations
  handleView: (feedback: Feedback) => void;
  handleDeleteClick: (feedback: Feedback) => void;
  handleDeleteConfirm: () => Promise<void>;
  
  // Delete modal
  deleteModal: {
    isOpen: boolean;
    feedback: Feedback | null;
  };
  setDeleteModal: (modal: { isOpen: boolean; feedback: Feedback | null }) => void;
  
  // Utilities
  formatTimestamp: (timestamp: any) => string | null;
  getAverageRating: () => string;
  getRatingCount: (rating: number) => number;
}

export function useFeedbackList(): UseFeedbackListReturn {
  const router = useRouter();
  
  // Data states
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    feedback: Feedback | null;
  }>({
    isOpen: false,
    feedback: null,
  });

  // Fetch initial data
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Fetch all users when feedback changes
  useEffect(() => {
    if (feedback.length > 0) {
      fetchAllUsers();
    }
  }, [feedback]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllFeedback();
      setFeedback(data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all unique users at once to avoid N+1 queries
  const fetchAllUsers = async () => {
    try {
      const uniqueUserIds = [...new Set(feedback.map(f => f.userId))];
      
      const users = await getUsersByIds(uniqueUserIds);
      const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, User>);
      
      setUserCache(userMap);
    } catch (err) {
      console.error('Error fetching users:', err);
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

  const getAverageRating = (): string => {
    if (feedback.length === 0) return '0.0';
    const total = feedback.reduce((sum, f) => sum + f.rating, 0);
    return (total / feedback.length).toFixed(1);
  };

  const getRatingCount = (rating: number): number => {
    return feedback.filter((f) => f.rating === rating).length;
  };

  // Navigation handlers
  const handleView = (item: Feedback) => {
    router.push(`/feedback/view/${item.id}`);
  };

  const handleDeleteClick = (item: Feedback) => {
    setDeleteModal({
      isOpen: true,
      feedback: item,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.feedback) return;

    try {
      await deleteFeedback(deleteModal.feedback.id);
      setDeleteModal({ isOpen: false, feedback: null });
      await fetchFeedback();
    } catch (err) {
      console.error('Error deleting feedback:', err);
      setError('Failed to delete feedback');
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

  // Filter and Sort Feedback
  const filteredAndSortedFeedback = useMemo(() => {
    let filtered = [...feedback];

    // Search filter (user name, email, or message)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        // Check message
        if (item.message.toLowerCase().includes(query)) return true;
        // Check user name and email
        const user = userCache[item.userId];
        if (user) {
          if (user.name.toLowerCase().includes(query)) return true;
          if (user.email.toLowerCase().includes(query)) return true;
        }
        return false;
      });
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const targetRating = parseInt(ratingFilter);
      filtered = filtered.filter((item) => item.rating === targetRating);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'user':
          aValue = (userCache[a.userId]?.name || 'Unknown').toLowerCase();
          bValue = (userCache[b.userId]?.name || 'Unknown').toLowerCase();
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'createdAt':
          aValue = a.createdAt?.toDate().getTime() || 0;
          bValue = b.createdAt?.toDate().getTime() || 0;
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
  }, [feedback, searchQuery, sortField, sortOrder, ratingFilter, userCache]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('createdAt');
    setSortOrder('desc');
    setRatingFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      ratingFilter !== 'all'
    );
  }, [searchQuery, ratingFilter]);

  return {
    // Data
    feedback,
    filteredAndSortedFeedback,
    userCache,
    
    // Loading states
    loading,
    error,
    
    // Filter states
    searchQuery,
    sortField,
    sortOrder,
    ratingFilter,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setSortField,
    setSortOrder,
    setRatingFilter,
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
    getAverageRating,
    getRatingCount,
  };
}
