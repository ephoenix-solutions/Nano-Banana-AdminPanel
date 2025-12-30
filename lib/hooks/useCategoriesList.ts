import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Subcategory } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import {
  getAllCategories,
  deleteCategory,
  deleteSubcategory,
} from '@/lib/services/category.service';
import { getUsersByIds } from '@/lib/services/user.service';

export type SortField = 'name' | 'order' | 'searchCount' | 'subcategories' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';
export type SubcategoryFilter = 'all' | 'with' | 'without';

interface UseCategoriesListReturn {
  // Data
  categories: Category[];
  filteredAndSortedCategories: Category[];
  userCache: Record<string, User>;
  expandedCategories: Set<string>;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Filter states
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  subcategoryFilter: SubcategoryFilter;
  hasActiveFilters: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setSubcategoryFilter: (filter: SubcategoryFilter) => void;
  handleSort: (field: SortField) => void;
  clearFilters: () => void;
  toggleCategory: (categoryId: string) => void;
  
  // CRUD operations
  handleAddCategory: () => void;
  handleViewCategory: (categoryId: string) => void;
  handleEditCategory: (categoryId: string) => void;
  handleDeleteCategoryClick: (category: Category) => void;
  handleAddSubcategory: (categoryId: string) => void;
  handleEditSubcategory: (categoryId: string, subcategoryId: string) => void;
  handleDeleteSubcategoryClick: (categoryId: string, subcategory: Subcategory) => void;
  handleDeleteConfirm: () => Promise<void>;
  
  // Delete modal
  deleteModal: {
    isOpen: boolean;
    type: 'category' | 'subcategory';
    categoryId: string | null;
    subcategoryId: string | null;
    name: string;
  };
  setDeleteModal: (modal: {
    isOpen: boolean;
    type: 'category' | 'subcategory';
    categoryId: string | null;
    subcategoryId: string | null;
    name: string;
  }) => void;
  
  // Utilities
  formatTimestamp: (timestamp: any) => string | null;
}

export function useCategoriesList(): UseCategoriesListReturn {
  const router = useRouter();
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('order');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [subcategoryFilter, setSubcategoryFilter] = useState<SubcategoryFilter>('all');
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'category' | 'subcategory';
    categoryId: string | null;
    subcategoryId: string | null;
    name: string;
  }>({
    isOpen: false,
    type: 'category',
    categoryId: null,
    subcategoryId: null,
    name: '',
  });

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch all users when categories change
  useEffect(() => {
    if (categories.length > 0) {
      fetchAllUsers();
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all unique users at once to avoid N+1 queries
  const fetchAllUsers = async () => {
    try {
      const uniqueUserIds = [
        ...new Set([
          ...categories.map(c => c.createdBy),
          ...categories.map(c => c.updatedBy).filter(Boolean) as string[],
          ...categories.flatMap(c => 
            c.subcategories?.map(s => s.createdBy) || []
          ),
          ...categories.flatMap(c => 
            c.subcategories?.map(s => s.updatedBy).filter(Boolean) || []
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
      }).format(date);
    } catch (error) {
      return null;
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set<string>();
      if (!prev.has(categoryId)) {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Navigation handlers
  const handleAddCategory = () => {
    router.push('/categories/add');
  };

  const handleViewCategory = (categoryId: string) => {
    router.push(`/categories/view/${categoryId}`);
  };

  const handleEditCategory = (categoryId: string) => {
    router.push(`/categories/edit/${categoryId}`);
  };

  const handleDeleteCategoryClick = (category: Category) => {
    setDeleteModal({
      isOpen: true,
      type: 'category',
      categoryId: category.id,
      subcategoryId: null,
      name: category.name,
    });
  };

  const handleAddSubcategory = (categoryId: string) => {
    router.push(`/categories/${categoryId}/subcategories/add`);
  };

  const handleEditSubcategory = (categoryId: string, subcategoryId: string) => {
    router.push(`/categories/${categoryId}/subcategories/edit/${subcategoryId}`);
  };

  const handleDeleteSubcategoryClick = (categoryId: string, subcategory: Subcategory) => {
    setDeleteModal({
      isOpen: true,
      type: 'subcategory',
      categoryId,
      subcategoryId: subcategory.id,
      name: subcategory.name,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteModal.type === 'category' && deleteModal.categoryId) {
        await deleteCategory(deleteModal.categoryId);
      } else if (
        deleteModal.type === 'subcategory' &&
        deleteModal.categoryId &&
        deleteModal.subcategoryId
      ) {
        await deleteSubcategory(deleteModal.categoryId, deleteModal.subcategoryId);
      }
      setDeleteModal({
        isOpen: false,
        type: 'category',
        categoryId: null,
        subcategoryId: null,
        name: '',
      });
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting:', err);
      setError(`Failed to delete ${deleteModal.type}`);
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
    let filtered = [...categories];

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

    // Subcategory filter
    if (subcategoryFilter === 'with') {
      filtered = filtered.filter(
        (category) => category.subcategories && category.subcategories.length > 0
      );
    } else if (subcategoryFilter === 'without') {
      filtered = filtered.filter(
        (category) => !category.subcategories || category.subcategories.length === 0
      );
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
        case 'createdAt':
          aValue = a.createdAt?.toDate().getTime() || 0;
          bValue = b.createdAt?.toDate().getTime() || 0;
          break;
        case 'updatedAt':
          aValue = a.updatedAt?.toDate().getTime() || 0;
          bValue = b.updatedAt?.toDate().getTime() || 0;
          break;
        default:
          aValue = a.order || 0;
          bValue = b.order || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [categories, searchQuery, sortField, sortOrder, subcategoryFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('order');
    setSortOrder('asc');
    setSubcategoryFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      subcategoryFilter !== 'all'
    );
  }, [searchQuery, subcategoryFilter]);

  return {
    // Data
    categories,
    filteredAndSortedCategories,
    userCache,
    expandedCategories,
    
    // Loading states
    loading,
    error,
    
    // Filter states
    searchQuery,
    sortField,
    sortOrder,
    subcategoryFilter,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setSortField,
    setSortOrder,
    setSubcategoryFilter,
    handleSort,
    clearFilters,
    toggleCategory,
    
    // CRUD operations
    handleAddCategory,
    handleViewCategory,
    handleEditCategory,
    handleDeleteCategoryClick,
    handleAddSubcategory,
    handleEditSubcategory,
    handleDeleteSubcategoryClick,
    handleDeleteConfirm,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    formatTimestamp,
  };
}
