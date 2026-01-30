import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Country } from '@/lib/types/country.types';
import { Category } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import {
  getDeletedCountries,
  restoreCountry,
  permanentlyDeleteCountry,
} from '@/lib/services/country.service';
import { getAllCategories } from '@/lib/services/category.service';
import { getUsersByIds } from '@/lib/services/user.service';
import { useToast } from '@/components/shared/Toast';

export type SortField = 'name' | 'isoCode' | 'categories' | 'deletedAt';
export type SortOrder = 'asc' | 'desc';

interface UseCountriesTrashReturn {
  // Data
  deletedCountries: Country[];
  categories: Category[];
  filteredAndSortedCountries: Country[];
  userCache: Record<string, User>;
  
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
  
  // CRUD operations
  handleRestoreClick: (country: Country) => void;
  handleRestoreConfirm: () => Promise<void>;
  handlePermanentDeleteClick: (country: Country) => void;
  handlePermanentDeleteConfirm: () => Promise<void>;
  
  // Modals
  restoreModal: {
    isOpen: boolean;
    country: Country | null;
  };
  permanentDeleteModal: {
    isOpen: boolean;
    country: Country | null;
  };
  setRestoreModal: (modal: { isOpen: boolean; country: Country | null }) => void;
  setPermanentDeleteModal: (modal: { isOpen: boolean; country: Country | null }) => void;
  
  // Utilities
  getCategoryNames: (categoryIds: string[]) => string;
  formatTimestamp: (timestamp: any) => string | null;
}

export function useCountriesTrash(): UseCountriesTrashReturn {
  const router = useRouter();
  const { showToast } = useToast();
  
  // Data states
  const [deletedCountries, setDeletedCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('deletedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Modal states
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    country: Country | null;
  }>({
    isOpen: false,
    country: null,
  });
  
  const [permanentDeleteModal, setPermanentDeleteModal] = useState<{
    isOpen: boolean;
    country: Country | null;
  }>({
    isOpen: false,
    country: null,
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all users when countries change
  useEffect(() => {
    if (deletedCountries.length > 0) {
      fetchAllUsers();
    }
  }, [deletedCountries]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [countriesData, categoriesData] = await Promise.all([
        getDeletedCountries(),
        getAllCategories(),
      ]);
      setDeletedCountries(countriesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching deleted countries:', err);
      showToast('Failed to load deleted countries', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all unique users at once
  const fetchAllUsers = async () => {
    try {
      const uniqueUserIds = [
        ...new Set([
          ...deletedCountries.map(c => c.createdBy),
          ...deletedCountries.map(c => c.updatedBy).filter(Boolean) as string[],
          ...deletedCountries.map(c => c.deletedBy).filter(Boolean) as string[],
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

  const getCategoryNames = (categoryIds: string[]) => {
    if (!categoryIds || categoryIds.length === 0) return 'No categories';
    
    const names = categoryIds
      .map((id) => {
        const category = categories.find((c) => c.id === id);
        return category?.name;
      })
      .filter(Boolean);
    
    return names.length > 0 ? names.join(', ') : 'No categories';
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

  const handleRestoreClick = (country: Country) => {
    setRestoreModal({
      isOpen: true,
      country,
    });
  };

  const handleRestoreConfirm = async () => {
    if (!restoreModal.country) return;

    try {
      await restoreCountry(restoreModal.country.id);
      setRestoreModal({ isOpen: false, country: null });
      await fetchData();
      showToast('Country restored successfully', 'success');
    } catch (err) {
      console.error('Error restoring country:', err);
      showToast('Failed to restore country', 'error');
    }
  };

  const handlePermanentDeleteClick = (country: Country) => {
    setPermanentDeleteModal({
      isOpen: true,
      country,
    });
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteModal.country) return;

    try {
      await permanentlyDeleteCountry(permanentDeleteModal.country.id);
      setPermanentDeleteModal({ isOpen: false, country: null });
      await fetchData();
      showToast('Country permanently deleted', 'success');
    } catch (err) {
      console.error('Error permanently deleting country:', err);
      showToast('Failed to permanently delete country', 'error');
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

  // Filter and Sort Countries
  const filteredAndSortedCountries = useMemo(() => {
    let filtered = [...deletedCountries];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((country) => {
        return (
          country.name.toLowerCase().includes(query) ||
          country.isoCode.toLowerCase().includes(query)
        );
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
        case 'isoCode':
          aValue = (a.isoCode || '').toLowerCase();
          bValue = (b.isoCode || '').toLowerCase();
          break;
        case 'categories':
          aValue = a.categories?.length || 0;
          bValue = b.categories?.length || 0;
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
  }, [deletedCountries, searchQuery, sortField, sortOrder]);

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
    deletedCountries,
    categories,
    filteredAndSortedCountries,
    userCache,
    
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
    
    // CRUD operations
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
    getCategoryNames,
    formatTimestamp,
  };
}
