import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from '@/lib/types/prompt.types';
import { Category } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import {
  getAllPrompts,
  softDeletePrompt,
  toggleTrending,
} from '@/lib/services/prompt.service';
import { getAllCategories } from '@/lib/services/category.service';
import { getUserById, getUsersByIds } from '@/lib/services/user.service';
import { useToast } from '@/components/shared/Toast';
import { useAuth } from '@/lib/hooks/useAuth';

export type SortField = 'title' | 'likes' | 'createdAt' | 'searchCount' | 'saveCount' | 'category' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';
export type TrendingFilter = 'all' | 'trending' | 'not-trending';

interface UsePromptsListReturn {
  // Data
  prompts: Prompt[];
  categories: Category[];
  filteredAndSortedPrompts: Prompt[];
  userCache: Record<string, User>;
  
  // Loading states
  loading: boolean;
  
  // Filter states
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  categoryFilter: string;
  subcategoryFilter: string;
  trendingFilter: TrendingFilter;
  availableSubcategories: any[];
  hasActiveFilters: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setCategoryFilter: (category: string) => void;
  setSubcategoryFilter: (subcategory: string) => void;
  setTrendingFilter: (filter: TrendingFilter) => void;
  handleSort: (field: SortField) => void;
  clearFilters: () => void;
  
  // CRUD operations
  handleAddPrompt: () => void;
  handleView: (prompt: Prompt) => void;
  handleEdit: (prompt: Prompt) => void;
  handleDeleteClick: (prompt: Prompt) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleToggleTrending: (promptId: string, isTrending: boolean) => Promise<void>;
  
  // Delete modal
  deleteModal: {
    isOpen: boolean;
    prompt: Prompt | null;
  };
  setDeleteModal: (modal: { isOpen: boolean; prompt: Prompt | null }) => void;
  
  // Utilities
  getCategoryName: (categoryId: string) => string;
  getSubcategoryName: (categoryId: string, subcategoryId: string) => string;
  formatTimestamp: (timestamp: any) => string | null;
}

export function usePromptsList(): UsePromptsListReturn {
  const router = useRouter();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  
  // Data states
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [trendingFilter, setTrendingFilter] = useState<TrendingFilter>('all');
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    prompt: Prompt | null;
  }>({
    isOpen: false,
    prompt: null,
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all users when prompts change
  useEffect(() => {
    if (prompts.length > 0) {
      fetchAllUsers();
    }
  }, [prompts]);

  // Reset subcategory filter when category changes
  useEffect(() => {
    if (categoryFilter === 'all') {
      setSubcategoryFilter('all');
    }
  }, [categoryFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promptsData, categoriesData] = await Promise.all([
        getAllPrompts(),
        getAllCategories(),
      ]);
      setPrompts(promptsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Failed to load prompts', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all unique users at once to avoid N+1 queries
  const fetchAllUsers = async () => {
    try {
      const uniqueUserIds = [
        ...new Set([
          ...prompts.map(p => p.createdBy),
          ...prompts.map(p => p.updatedBy).filter(Boolean) as string[]
        ])
      ];
      
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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const subcategory = category?.subcategories?.find(
      (s) => s.id === subcategoryId
    );
    return subcategory?.name || 'Unknown';
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

  // Navigation handlers
  const handleAddPrompt = () => {
    router.push('/prompts/add');
  };

  const handleView = (prompt: Prompt) => {
    router.push(`/prompts/view/${prompt.id}`);
  };

  const handleEdit = (prompt: Prompt) => {
    router.push(`/prompts/edit/${prompt.id}`);
  };

  const handleDeleteClick = (prompt: Prompt) => {
    setDeleteModal({
      isOpen: true,
      prompt,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.prompt) return;

    try {
      // Get current user ID for soft delete
      const currentUserId = currentUser?.uid || currentUser?.id || '';
      
      if (!currentUserId) {
        console.warn('No current user ID available for deletedBy field');
      }
      
      await softDeletePrompt(deleteModal.prompt.id, currentUserId);
      setDeleteModal({ isOpen: false, prompt: null });
      await fetchData();
      showToast('Prompt moved to trash', 'success');
    } catch (err) {
      console.error('Error deleting prompt:', err);
      showToast('Failed to delete prompt', 'error');
    }
  };

  const handleToggleTrending = async (promptId: string, isTrending: boolean) => {
    try {
      await toggleTrending(promptId, !isTrending);
      await fetchData();
      showToast(`Prompt ${!isTrending ? 'marked as' : 'removed from'} trending`, 'success');
    } catch (err) {
      console.error('Error toggling trending:', err);
      showToast('Failed to update trending status', 'error');
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

  // Get subcategories for selected category
  const availableSubcategories = useMemo(() => {
    if (categoryFilter === 'all') return [];
    const category = categories.find((c) => c.id === categoryFilter);
    return category?.subcategories || [];
  }, [categoryFilter, categories]);

  // Filter and Sort Prompts
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = [...prompts];

    // Search filter (title, tags, or prompt content)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((prompt) => {
        if (prompt.title.toLowerCase().includes(query)) return true;
        if (prompt.tags && prompt.tags.some((tag) => tag.toLowerCase().includes(query))) return true;
        if (prompt.prompt.toLowerCase().includes(query)) return true;
        return false;
      });
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((prompt) => prompt.categoryId === categoryFilter);
    }

    // Subcategory filter
    if (subcategoryFilter !== 'all') {
      filtered = filtered.filter((prompt) => prompt.subCategoryId === subcategoryFilter);
    }

    // Trending filter
    if (trendingFilter === 'trending') {
      filtered = filtered.filter((prompt) => prompt.isTrending);
    } else if (trendingFilter === 'not-trending') {
      filtered = filtered.filter((prompt) => !prompt.isTrending);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'likes':
          aValue = a.likesCount || 0;
          bValue = b.likesCount || 0;
          break;
        case 'searchCount':
          aValue = a.searchCount || 0;
          bValue = b.searchCount || 0;
          break;
        case 'saveCount':
          aValue = a.savesCount || 0;
          bValue = b.savesCount || 0;
          break;
        case 'category':
          aValue = getCategoryName(a.categoryId).toLowerCase();
          bValue = getCategoryName(b.categoryId).toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt?.toDate().getTime() || 0;
          bValue = b.createdAt?.toDate().getTime() || 0;
          break;
        case 'updatedAt':
          aValue = a.updatedAt?.toDate().getTime() || 0;
          bValue = b.updatedAt?.toDate().getTime() || 0;
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
  }, [prompts, searchQuery, sortField, sortOrder, categoryFilter, subcategoryFilter, trendingFilter, categories]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('createdAt');
    setSortOrder('desc');
    setCategoryFilter('all');
    setSubcategoryFilter('all');
    setTrendingFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      categoryFilter !== 'all' ||
      subcategoryFilter !== 'all' ||
      trendingFilter !== 'all'
    );
  }, [searchQuery, categoryFilter, subcategoryFilter, trendingFilter]);

  return {
    // Data
    prompts,
    categories,
    filteredAndSortedPrompts,
    userCache,
    
    // Loading states
    loading,
    
    // Filter states
    searchQuery,
    sortField,
    sortOrder,
    categoryFilter,
    subcategoryFilter,
    trendingFilter,
    availableSubcategories,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setSortField,
    setSortOrder,
    setCategoryFilter,
    setSubcategoryFilter,
    setTrendingFilter,
    handleSort,
    clearFilters,
    
    // CRUD operations
    handleAddPrompt,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleToggleTrending,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    getCategoryName,
    getSubcategoryName,
    formatTimestamp,
  };
}
