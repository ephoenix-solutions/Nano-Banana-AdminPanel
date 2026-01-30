import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from '@/lib/types/prompt.types';
import { Category } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import {
  getDeletedPrompts,
  restorePrompt,
  permanentlyDeletePrompt,
} from '@/lib/services/prompt.service';
import { getAllCategories } from '@/lib/services/category.service';
import { getUsersByIds } from '@/lib/services/user.service';
import { useToast } from '@/components/shared/Toast';

export type SortField = 'title' | 'deletedAt' | 'category';
export type SortOrder = 'asc' | 'desc';

interface UsePromptsTrashReturn {
  // Data
  deletedPrompts: Prompt[];
  categories: Category[];
  filteredAndSortedPrompts: Prompt[];
  userCache: Record<string, User>;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Filter states
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  categoryFilter: string;
  hasActiveFilters: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  handleSort: (field: SortField) => void;
  clearFilters: () => void;
  
  // CRUD operations
  handleView: (prompt: Prompt) => void;
  handleRestoreClick: (prompt: Prompt) => void;
  handleRestoreConfirm: () => Promise<void>;
  handlePermanentDeleteClick: (prompt: Prompt) => void;
  handlePermanentDeleteConfirm: () => Promise<void>;
  
  // Modals
  restoreModal: {
    isOpen: boolean;
    prompt: Prompt | null;
  };
  permanentDeleteModal: {
    isOpen: boolean;
    prompt: Prompt | null;
  };
  setRestoreModal: (modal: { isOpen: boolean; prompt: Prompt | null }) => void;
  setPermanentDeleteModal: (modal: { isOpen: boolean; prompt: Prompt | null }) => void;
  
  // Utilities
  getCategoryName: (categoryId: string) => string;
  getSubcategoryName: (categoryId: string, subcategoryId: string) => string;
  formatTimestamp: (timestamp: any) => string | null;
}

export function usePromptsTrash(): UsePromptsTrashReturn {
  const router = useRouter();
  const { showToast } = useToast();
  
  // Data states
  const [deletedPrompts, setDeletedPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('deletedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Modal states
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    prompt: Prompt | null;
  }>({
    isOpen: false,
    prompt: null,
  });
  
  const [permanentDeleteModal, setPermanentDeleteModal] = useState<{
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
    if (deletedPrompts.length > 0) {
      fetchAllUsers();
    }
  }, [deletedPrompts]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [promptsData, categoriesData] = await Promise.all([
        getDeletedPrompts(),
        getAllCategories(),
      ]);
      setDeletedPrompts(promptsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching deleted prompts:', err);
      showToast('Failed to load deleted prompts', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all unique users at once
  const fetchAllUsers = async () => {
    try {
      const uniqueUserIds = [
        ...new Set([
          ...deletedPrompts.map(p => p.createdBy),
          ...deletedPrompts.map(p => p.deletedBy).filter(Boolean) as string[]
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
  const handleView = (prompt: Prompt) => {
    router.push(`/prompts/view/${prompt.id}?from=trash`);
  };

  const handleRestoreClick = (prompt: Prompt) => {
    setRestoreModal({
      isOpen: true,
      prompt,
    });
  };

  const handleRestoreConfirm = async () => {
    if (!restoreModal.prompt) return;

    try {
      await restorePrompt(restoreModal.prompt.id);
      setRestoreModal({ isOpen: false, prompt: null });
      await fetchData();
      showToast('Prompt restored successfully', 'success');
    } catch (err) {
      console.error('Error restoring prompt:', err);
      showToast('Failed to restore prompt', 'error');
    }
  };

  const handlePermanentDeleteClick = (prompt: Prompt) => {
    setPermanentDeleteModal({
      isOpen: true,
      prompt,
    });
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteModal.prompt) return;

    try {
      await permanentlyDeletePrompt(permanentDeleteModal.prompt.id);
      setPermanentDeleteModal({ isOpen: false, prompt: null });
      await fetchData();
      showToast('Prompt permanently deleted', 'success');
    } catch (err) {
      console.error('Error permanently deleting prompt:', err);
      showToast('Failed to permanently delete prompt', 'error');
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

  // Filter and Sort Prompts
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = [...deletedPrompts];

    // Search filter
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

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'category':
          aValue = getCategoryName(a.categoryId).toLowerCase();
          bValue = getCategoryName(b.categoryId).toLowerCase();
          break;
        case 'deletedAt':
          aValue = a.deletedAt?.toDate().getTime() || 0;
          bValue = b.deletedAt?.toDate().getTime() || 0;
          break;
        default:
          aValue = a.deletedAt?.toDate().getTime() || 0;
          bValue = b.deletedAt?.toDate().getTime() || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [deletedPrompts, searchQuery, sortField, sortOrder, categoryFilter, categories]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('deletedAt');
    setSortOrder('desc');
    setCategoryFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      categoryFilter !== 'all'
    );
  }, [searchQuery, categoryFilter]);

  return {
    // Data
    deletedPrompts,
    categories,
    filteredAndSortedPrompts,
    userCache,
    
    // Loading states
    loading,
    error,
    
    // Filter states
    searchQuery,
    sortField,
    sortOrder,
    categoryFilter,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setCategoryFilter,
    handleSort,
    clearFilters,
    
    // CRUD operations
    handleView,
    handleRestoreClick,
    handleRestoreConfirm,
    handlePermanentDeleteClick,
    handlePermanentDeleteConfirm,
    
    // Modals
    restoreModal,
    permanentDeleteModal,
    setRestoreModal,
    setPermanentDeleteModal,
    
    // Utilities
    getCategoryName,
    getSubcategoryName,
    formatTimestamp,
  };
}
