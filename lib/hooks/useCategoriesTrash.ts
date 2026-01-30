import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Subcategory } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import {
  getDeletedCategories,
  getOrphanedDeletedSubcategories,
  restoreCategory,
  permanentlyDeleteCategory,
  restoreSubcategory,
  permanentlyDeleteSubcategory,
} from '@/lib/services/category.service';
import { getUsersByIds } from '@/lib/services/user.service';
import { useToast } from '@/components/shared/Toast';

export type SortField = 'name' | 'order' | 'searchCount' | 'subcategories' | 'deletedAt';
export type SortOrder = 'asc' | 'desc';

interface UseCategoriesTrashReturn {
  // Data
  deletedCategories: Category[];
  orphanedSubcategories: Array<{ categoryId: string; categoryName: string; subcategory: Subcategory }>;
  filteredAndSortedCategories: Category[];
  filteredOrphanedSubcategories: Array<{ categoryId: string; categoryName: string; subcategory: Subcategory }>;
  userCache: Record<string, User>;
  expandedCategories: Set<string>;
  
  // Loading states
  loading: boolean;
  
  // Filter states
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  hasActiveFilters: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  handleSort: (field: SortField) => void;
  clearFilters: () => void;
  toggleCategory: (categoryId: string) => void;
  
  // CRUD operations
  handleRestoreClick: (category: Category) => void;
  handleRestoreConfirm: () => Promise<void>;
  handlePermanentDeleteClick: (category: Category) => void;
  handlePermanentDeleteConfirm: () => Promise<void>;
  handleRestoreSubcategoryClick: (categoryId: string, categoryName: string, subcategory: Subcategory) => void;
  handleRestoreSubcategoryConfirm: () => Promise<void>;
  handlePermanentDeleteSubcategoryClick: (categoryId: string, categoryName: string, subcategory: Subcategory) => void;
  handlePermanentDeleteSubcategoryConfirm: () => Promise<void>;
  
  // Modals
  restoreModal: {
    isOpen: boolean;
    category: Category | null;
  };
  permanentDeleteModal: {
    isOpen: boolean;
    category: Category | null;
  };
  restoreSubcategoryModal: {
    isOpen: boolean;
    categoryId: string | null;
    categoryName: string | null;
    subcategory: Subcategory | null;
  };
  permanentDeleteSubcategoryModal: {
    isOpen: boolean;
    categoryId: string | null;
    categoryName: string | null;
    subcategory: Subcategory | null;
  };
  setRestoreModal: (modal: { isOpen: boolean; category: Category | null }) => void;
  setPermanentDeleteModal: (modal: { isOpen: boolean; category: Category | null }) => void;
  setRestoreSubcategoryModal: (modal: { isOpen: boolean; categoryId: string | null; categoryName: string | null; subcategory: Subcategory | null }) => void;
  setPermanentDeleteSubcategoryModal: (modal: { isOpen: boolean; categoryId: string | null; categoryName: string | null; subcategory: Subcategory | null }) => void;
  
  // Utilities
  formatTimestamp: (timestamp: any) => string | null;
}

export function useCategoriesTrash(): UseCategoriesTrashReturn {
  const router = useRouter();
  const { showToast } = useToast();
  
  // Data states
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [orphanedSubcategories, setOrphanedSubcategories] = useState<Array<{ categoryId: string; categoryName: string; subcategory: Subcategory }>>([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('deletedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Modal states
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({
    isOpen: false,
    category: null,
  });
  
  const [permanentDeleteModal, setPermanentDeleteModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({
    isOpen: false,
    category: null,
  });
  
  const [restoreSubcategoryModal, setRestoreSubcategoryModal] = useState<{
    isOpen: boolean;
    categoryId: string | null;
    categoryName: string | null;
    subcategory: Subcategory | null;
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: null,
    subcategory: null,
  });
  
  const [permanentDeleteSubcategoryModal, setPermanentDeleteSubcategoryModal] = useState<{
    isOpen: boolean;
    categoryId: string | null;
    categoryName: string | null;
    subcategory: Subcategory | null;
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: null,
    subcategory: null,
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all users when categories change
  useEffect(() => {
    if (deletedCategories.length > 0) {
      fetchAllUsers();
    }
  }, [deletedCategories]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, orphanedData] = await Promise.all([
        getDeletedCategories(),
        getOrphanedDeletedSubcategories(),
      ]);
      setDeletedCategories(categoriesData);
      setOrphanedSubcategories(orphanedData);
    } catch (err) {
      console.error('Error fetching deleted categories:', err);
      showToast('Failed to load deleted categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all unique users at once
  const fetchAllUsers = async () => {
    try {
      const uniqueUserIds = [
        ...new Set([
          ...deletedCategories.map(c => c.createdBy),
          ...deletedCategories.map(c => c.updatedBy).filter(Boolean) as string[],
          ...deletedCategories.map(c => c.deletedBy).filter(Boolean) as string[],
          ...deletedCategories.flatMap(c => 
            c.subcategories?.map(s => s.createdBy) || []
          ),
          ...deletedCategories.flatMap(c => 
            c.subcategories?.map(s => s.updatedBy).filter(Boolean) || []
          ) as string[],
          ...deletedCategories.flatMap(c => 
            c.subcategories?.map(s => s.deletedBy).filter(Boolean) || []
          ) as string[],
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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleRestoreClick = (category: Category) => {
    setRestoreModal({
      isOpen: true,
      category,
    });
  };

  const handleRestoreConfirm = async () => {
    if (!restoreModal.category) return;

    try {
      await restoreCategory(restoreModal.category.id);
      setRestoreModal({ isOpen: false, category: null });
      await fetchData();
      showToast('Category restored successfully', 'success');
    } catch (err) {
      console.error('Error restoring category:', err);
      showToast('Failed to restore category', 'error');
    }
  };

  const handlePermanentDeleteClick = (category: Category) => {
    setPermanentDeleteModal({
      isOpen: true,
      category,
    });
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteModal.category) return;

    try {
      await permanentlyDeleteCategory(permanentDeleteModal.category.id);
      setPermanentDeleteModal({ isOpen: false, category: null });
      await fetchData();
      showToast('Category permanently deleted', 'success');
    } catch (err) {
      console.error('Error permanently deleting category:', err);
      showToast('Failed to permanently delete category', 'error');
    }
  };

  // Subcategory handlers
  const handleRestoreSubcategoryClick = (categoryId: string, categoryName: string, subcategory: Subcategory) => {
    setRestoreSubcategoryModal({
      isOpen: true,
      categoryId,
      categoryName,
      subcategory,
    });
  };

  const handleRestoreSubcategoryConfirm = async () => {
    if (!restoreSubcategoryModal.categoryId || !restoreSubcategoryModal.subcategory) return;

    try {
      await restoreSubcategory(restoreSubcategoryModal.categoryId, restoreSubcategoryModal.subcategory.id);
      setRestoreSubcategoryModal({ isOpen: false, categoryId: null, categoryName: null, subcategory: null });
      await fetchData();
      showToast('Subcategory restored successfully', 'success');
    } catch (err) {
      console.error('Error restoring subcategory:', err);
      showToast('Failed to restore subcategory', 'error');
    }
  };

  const handlePermanentDeleteSubcategoryClick = (categoryId: string, categoryName: string, subcategory: Subcategory) => {
    setPermanentDeleteSubcategoryModal({
      isOpen: true,
      categoryId,
      categoryName,
      subcategory,
    });
  };

  const handlePermanentDeleteSubcategoryConfirm = async () => {
    if (!permanentDeleteSubcategoryModal.categoryId || !permanentDeleteSubcategoryModal.subcategory) return;

    try {
      await permanentlyDeleteSubcategory(permanentDeleteSubcategoryModal.categoryId, permanentDeleteSubcategoryModal.subcategory.id);
      setPermanentDeleteSubcategoryModal({ isOpen: false, categoryId: null, categoryName: null, subcategory: null });
      await fetchData();
      showToast('Subcategory permanently deleted', 'success');
    } catch (err) {
      console.error('Error permanently deleting subcategory:', err);
      showToast('Failed to permanently delete subcategory', 'error');
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

  // Filter and Sort Categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = [...deletedCategories];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((category) => {
        if (category.name.toLowerCase().includes(query)) {
          return true;
        }
        if (category.subcategories && category.subcategories.length > 0) {
          return category.subcategories.some((sub) =>
            sub.name.toLowerCase().includes(query)
          );
        }
        return false;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'order':
          aValue = a.order || 0;
          bValue = b.order || 0;
          break;
        case 'searchCount':
          aValue = a.searchCount || 0;
          bValue = b.searchCount || 0;
          break;
        case 'subcategories':
          aValue = a.subcategories?.length || 0;
          bValue = b.subcategories?.length || 0;
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
  }, [deletedCategories, searchQuery, sortField, sortOrder]);

  // Filter orphaned subcategories
  const filteredOrphanedSubcategories = useMemo(() => {
    let filtered = [...orphanedSubcategories];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.subcategory.name.toLowerCase().includes(query) ||
          item.categoryName.toLowerCase().includes(query)
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = (a.subcategory.name || '').toLowerCase();
          bValue = (b.subcategory.name || '').toLowerCase();
          break;
        case 'order':
          aValue = a.subcategory.order || 0;
          bValue = b.subcategory.order || 0;
          break;
        case 'searchCount':
          aValue = a.subcategory.searchCount || 0;
          bValue = b.subcategory.searchCount || 0;
          break;
        case 'deletedAt':
          aValue = a.subcategory.deletedAt?.toDate().getTime() || 0;
          bValue = b.subcategory.deletedAt?.toDate().getTime() || 0;
          break;
        default:
          aValue = a.subcategory.deletedAt?.toDate().getTime() || 0;
          bValue = b.subcategory.deletedAt?.toDate().getTime() || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [orphanedSubcategories, searchQuery, sortField, sortOrder]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('deletedAt');
    setSortOrder('desc');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() !== '';
  }, [searchQuery]);

  return {
    // Data
    deletedCategories,
    orphanedSubcategories,
    filteredAndSortedCategories,
    filteredOrphanedSubcategories,
    userCache,
    expandedCategories,
    
    // Loading states
    loading,
    
    // Filter states
    searchQuery,
    sortField,
    sortOrder,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    handleSort,
    clearFilters,
    toggleCategory,
    
    // CRUD operations
    handleRestoreClick,
    handleRestoreConfirm,
    handlePermanentDeleteClick,
    handlePermanentDeleteConfirm,
    handleRestoreSubcategoryClick,
    handleRestoreSubcategoryConfirm,
    handlePermanentDeleteSubcategoryClick,
    handlePermanentDeleteSubcategoryConfirm,
    
    // Modals
    restoreModal,
    permanentDeleteModal,
    restoreSubcategoryModal,
    permanentDeleteSubcategoryModal,
    setRestoreModal,
    setPermanentDeleteModal,
    setRestoreSubcategoryModal,
    setPermanentDeleteSubcategoryModal,
    
    // Utilities
    formatTimestamp,
  };
}
