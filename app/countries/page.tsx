'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { Country } from '@/lib/types/country.types';
import { Category } from '@/lib/types/category.types';
import {
  getAllCountries,
  deleteCountry,
} from '@/lib/services/country.service';
import { getAllCategories } from '@/lib/services/category.service';
import { getUserById } from '@/lib/services/user.service';
import { Timestamp } from 'firebase/firestore';

type SortField = 'name' | 'isoCode' | 'categories' | 'createdAt' | 'updatedAt';
type SortOrder = 'asc' | 'desc';
type CategoryFilter = 'all' | 'with' | 'without' | string; // 'all', 'with', 'without', or specific category ID

// Helper function to format timestamp
const formatTimestamp = (timestamp: any) => {
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

// Helper component to display creator name
function CreatedByCell({ 
  userId, 
  fetchUserName 
}: { 
  userId: string; 
  fetchUserName: (id: string) => Promise<string>;
}) {
  const [name, setName] = useState<string>('Loading...');
  const [photoURL, setPhotoURL] = useState<string>('');

  useEffect(() => {
    if (userId) {
      fetchUserName(userId).then(setName);
      // Fetch user photo
      getUserById(userId).then(user => {
        if (user?.photoURL) {
          setPhotoURL(user.photoURL);
        }
      }).catch(() => {
        setPhotoURL('');
      });
    } else {
      setName('Unknown');
    }
  }, [userId, fetchUserName]);

  return (
    <div className="flex items-center gap-2">
      {photoURL ? (
        <img
          src={photoURL}
          alt={name}
          className="w-6 h-6 rounded-full object-cover border border-accent/20"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
            if (placeholder) placeholder.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center"
        style={{ display: photoURL ? 'none' : 'flex' }}
      >
        <Icons.users size={12} className="text-accent" />
      </div>
      <span className="text-sm">{name}</span>
    </div>
  );
}

export default function CountriesPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    country: Country | null;
  }>({
    isOpen: false,
    country: null,
  });

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

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
      await fetchData();
    } catch (err) {
      console.error('Error deleting country:', err);
      setError('Failed to delete country');
    }
  };

  // Handle sorting
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

  // Sortable header component
  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.blur();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      handleSort(field);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onPointerDown={handlePointerDown}
        className="flex items-center gap-2 transition-all cursor-pointer group"
        style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
        tabIndex={-1}
      >
        <span>{label}</span>
        <div className="flex flex-col">
          <Icons.chevronUp
            size={16}
            className={`-mb-1 transition-all group-hover:scale-110 ${
              sortField === field && sortOrder === 'asc'
                ? 'text-accent'
                : 'text-secondary/30'
            }`}
          />
          <Icons.chevronDown
            size={16}
            className={`-mt-1 transition-all group-hover:scale-110 ${
              sortField === field && sortOrder === 'desc'
                ? 'text-accent'
                : 'text-secondary/30'
            }`}
          />
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Countries' }]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Countries
            </h1>
            <p className="text-secondary mt-2 font-body">
              Manage country data and assigned categories
            </p>
          </div>
          <button
            onClick={handleAddCountry}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.plus size={20} />
            <span>Add Country</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg border border-primary/10 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.search size={20} className="text-secondary" />
                </div>
                <input
                  type="text"
                  placeholder="Search by country name or ISO code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary placeholder-secondary/50"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-64">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
              >
                <option value="all">All Countries</option>
                <option value="with">With Categories</option>
                <option value="without">Without Categories</option>
                <option disabled>───────────────</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-secondary/20 text-secondary rounded-lg font-semibold hover:bg-secondary/10 transition-all whitespace-nowrap"
              >
                <Icons.close size={20} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-primary/10">
            <p className="text-sm text-secondary font-body">
              Showing <span className="font-semibold text-primary">{filteredAndSortedCountries.length}</span> of{' '}
              <span className="font-semibold text-primary">{countries.length}</span> countries
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Countries
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {countries.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.globe size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  With Categories
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {countries.filter((c) => c.categories && c.categories.length > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.categories size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Without Categories
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {countries.filter((c) => !c.categories || c.categories.length === 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.alert size={24} className="text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error}</p>
            </div>
          </div>
        )}

        {/* Countries Table - Only show if there are results OR if loading */}
        {(loading || filteredAndSortedCountries.length > 0) && (
          <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-primary/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="name" label="Country Name" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="isoCode" label="ISO Code" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="categories" label="Assigned Categories" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="createdAt" label="Created At" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="updatedAt" label="Updated By" />
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedCountries.map((country, index) => (
                  <tr
                    key={country.id}
                    className={`transition-colors ${
                      index % 2 === 0
                        ? 'bg-white hover:bg-background/50'
                        : 'bg-background hover:bg-background-200'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-primary">
                        {country.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary font-mono">
                        {country.isoCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/20 text-primary">
                          {country.categories?.length || 0} categories
                        </span>
                        {country.categories && country.categories.length > 0 && (
                          <span className="text-xs text-secondary truncate max-w-xs">
                            {getCategoryNames(country.categories)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      <div className="flex flex-col gap-1">
                        <CreatedByCell userId={country.createdBy} fetchUserName={fetchUserName} />
                        {country.createdAt && (
                          <span className="text-xs text-secondary">
                            {formatTimestamp(country.createdAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      {country.updatedBy ? (
                        <div className="flex flex-col gap-1">
                          <CreatedByCell userId={country.updatedBy} fetchUserName={fetchUserName} />
                          {country.updatedAt && (
                            <span className="text-xs text-secondary">
                              {formatTimestamp(country.updatedAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-secondary text-xs">Not updated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(country)}
                          className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                          title="View"
                        >
                          <Icons.eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(country)}
                          className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer"
                          title="Edit"
                        >
                          <Icons.edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(country)}
                          className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Icons.trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {!loading && filteredAndSortedCountries.length === 0 && countries.length > 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.search size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No countries found</h3>
            <p className="text-secondary mb-4">
              No countries match your current filters. Try adjusting your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* No Data Message - Show when database is truly empty */}
        {!loading && countries.length === 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.globe size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No countries yet</h3>
            <p className="text-secondary mb-4">
              There are no countries in the system. Add your first country to get started.
            </p>
            <button
              onClick={handleAddCountry}
              className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all inline-flex items-center gap-2"
            >
              <Icons.plus size={20} />
              <span>Add Country</span>
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, country: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Country"
          message={`Are you sure you want to delete "${deleteModal.country?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
