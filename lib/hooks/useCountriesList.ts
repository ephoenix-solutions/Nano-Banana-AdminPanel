import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Country } from '@/lib/types/country.types';
import { Category } from '@/lib/types/category.types';
import {
  getAllCountries,
  deleteCountry,
} from '@/lib/services/country.service';
import { getAllCategories } from '@/lib/services/category.service';
import { getUserById } from '@/lib/services/user.service';

export type SortField = 'name' | 'isoCode' | 'categories' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';
export type CategoryFilter = 'all' | 'with' | 'without' | string;

interface UseCountriesListReturn {
  // Data
  countries: Country[];
  categories: Category[];
  filteredAndSortedCountries: Country[];
  userNames: Record<string, string>;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Filter states
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  categoryFilter: CategoryFilter;
  hasActiveFilters: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setCategoryFilter: (filter: CategoryFilter) => void;
  handleSort: (field: SortField) => void;
  clearFilters: () => void;
  
  // CRUD operations
  handleAddCountry: () => void;
  handleView: (country: Country) => void;
  handleEdit: (country: Country) => void;
  handleDeleteClick: (country: Country) => void;
  handleDeleteConfirm: () => Promise<void>;
  
  // Delete modal
  deleteModal: {
    isOpen: boolean;
    country: Country | null;
  };
  setDeleteModal: (modal: { isOpen: boolean; country: Country | null }) => void;
  
  // Utilities
  getCategoryNames: (categoryIds: string[]) => string;
  fetchUserName: (userId: string) => Promise<string>;
  formatTimestamp: (timestamp: any) => string | null;
}

export function useCountriesList(): UseCountriesListReturn {
  const router = useRouter();
  
  // Data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [countriesData, categoriesData] = await Promise.all([
        getAllCountries(),
        getAllCategories(),
      ]);
      setCountries(countriesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserName = async (userId: string): Promise<string> => {
    if (!userId) {
      return 'Unknown';
    }

    // Check cache first
    if (userNames[userId]) {
      return userNames[userId];
    }

    try {
      const user = await getUserById(userId);
      const name = user?.name || 'Unknown Admin';
      
      // Update cache
      setUserNames(prev => ({ ...prev, [userId]: name }));
      
      return name;
    } catch (error) {
      console.error('Error fetching user:', error);
      return 'Unknown Admin';
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

  // Navigation handlers
  const handleAddCountry = () => {
    router.push('/countries/add');
  };

  const handleView = (country: Country) => {
    router.push(`/countries/view/${country.id}`);
  };

  const handleEdit = (country: Country) => {
    router.push(`/countries/edit/${country.id}`);
  };

  const handleDeleteClick = (country: Country) => {
    setDeleteModal({
      isOpen: true,
      country,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.country) return;

    try {
      await deleteCountry(deleteModal.country.id);
      setDeleteModal({ isOpen: false, country: null });
      await fetchData();
    } catch (err) {
      console.error('Error deleting country:', err);
      setError('Failed to delete country');
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
    let filtered = [...countries];

    // Search filter (name or ISO code)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (country) =>
          country.name.toLowerCase().includes(query) ||
          country.isoCode.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter === 'with') {
      filtered = filtered.filter(
        (country) => country.categories && country.categories.length > 0
      );
    } else if (categoryFilter === 'without') {
      filtered = filtered.filter(
        (country) => !country.categories || country.categories.length === 0
      );
    } else if (categoryFilter !== 'all') {
      // Specific category filter
      filtered = filtered.filter(
        (country) =>
          country.categories && country.categories.includes(categoryFilter)
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
        case 'isoCode':
          aValue = (a.isoCode || '').toLowerCase();
          bValue = (b.isoCode || '').toLowerCase();
          break;
        case 'categories':
          aValue = a.categories?.length || 0;
          bValue = b.categories?.length || 0;
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
  }, [countries, searchQuery, sortField, sortOrder, categoryFilter, categories]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('name');
    setSortOrder('asc');
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
    countries,
    categories,
    filteredAndSortedCountries,
    userNames,
    
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
    setSortField,
    setSortOrder,
    setCategoryFilter,
    handleSort,
    clearFilters,
    
    // CRUD operations
    handleAddCountry,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    getCategoryNames,
    fetchUserName,
    formatTimestamp,
  };
}
