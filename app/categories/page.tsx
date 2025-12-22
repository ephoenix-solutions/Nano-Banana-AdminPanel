'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { Category, Subcategory } from '@/lib/types/category.types';
import {
  getAllCategories,
  deleteCategory,
  deleteSubcategory,
} from '@/lib/services/category.service';
import { getUserById } from '@/lib/services/user.service';
import { Timestamp } from 'firebase/firestore';

type SortField = 'name' | 'order';
type SortOrder = 'asc' | 'desc';
type SubcategoryFilter = 'all' | 'with' | 'without';

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

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
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

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('order');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [subcategoryFilter, setSubcategoryFilter] = useState<SubcategoryFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleEditSubcategory = (
    categoryId: string,
    subcategoryId: string
  ) => {
    router.push(`/categories/${categoryId}/subcategories/edit/${subcategoryId}`);
  };

  const handleDeleteSubcategoryClick = (
    categoryId: string,
    subcategory: Subcategory
  ) => {
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
        await deleteSubcategory(
          deleteModal.categoryId,
          deleteModal.subcategoryId
        );
      }
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting:', err);
      setError(`Failed to delete ${deleteModal.type}`);
    }
  };

  // Filter and Sort Categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = [...categories];

    // Search filter (category name or subcategory name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((category) => {
        // Check category name
        if (category.name.toLowerCase().includes(query)) {
          return true;
        }
        // Check subcategory names
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

      if (sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortField === 'order') {
        aValue = a.order;
        bValue = b.order;
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
      sortField !== 'order' ||
      sortOrder !== 'asc' ||
      subcategoryFilter !== 'all'
    );
  }, [searchQuery, sortField, sortOrder, subcategoryFilter]);

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
        <Breadcrumbs items={[{ label: 'Categories' }]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Categories
            </h1>
            <p className="text-secondary mt-2 font-body">
              Manage categories and subcategories
            </p>
          </div>
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.plus size={20} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg border border-primary/10 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.search size={20} className="text-secondary" />
                </div>
                <input
                  type="text"
                  placeholder="Search by category or subcategory name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary placeholder-secondary/50"
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg font-semibold transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-accent/20 border-accent text-primary'
                  : 'border-primary/20 text-secondary hover:bg-accent/10'
              }`}
            >
              <Icons.filter size={20} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-accent text-primary text-xs rounded-full font-bold">
                  {[
                    searchQuery.trim() !== '',
                    subcategoryFilter !== 'all',
                    sortField !== 'order' || sortOrder !== 'asc',
                  ].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 border border-secondary/20 text-secondary rounded-lg font-semibold hover:bg-secondary/10 transition-all"
              >
                <Icons.close size={20} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-primary/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-primary font-body mb-2">
                  Sort By
                </label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
                >
                  <option value="order">Order</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-semibold text-primary font-body mb-2">
                  Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              {/* Subcategory Filter */}
              <div>
                <label className="block text-sm font-semibold text-primary font-body mb-2">
                  Subcategories
                </label>
                <select
                  value={subcategoryFilter}
                  onChange={(e) => setSubcategoryFilter(e.target.value as SubcategoryFilter)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
                >
                  <option value="all">All Categories</option>
                  <option value="with">With Subcategories</option>
                  <option value="without">Without Subcategories</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-primary/10">
            <p className="text-sm text-secondary font-body">
              Showing <span className="font-semibold text-primary">{filteredAndSortedCategories.length}</span> of{' '}
              <span className="font-semibold text-primary">{categories.length}</span> categories
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Categories
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {categories.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.categories size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Subcategories
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {categories.reduce(
                    (sum, cat) => sum + (cat.subcategories?.length || 0),
                    0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.file size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Searches
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {categories.reduce(
                    (sum, cat) =>
                      sum + parseInt(String(cat.searchCount) || '0'),
                    0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.search size={24} className="text-accent" />
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

        {/* Categories Table - Only show if there are results OR if loading */}
        {(loading || filteredAndSortedCategories.length > 0) && (
          <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-primary/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body w-12"></th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Search Count
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Subcategories
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Created By
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Updated By
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {filteredAndSortedCategories.map((category) => {
                  const isExpanded = expandedCategories.has(category.id);
                  const hasSubcategories =
                    category.subcategories && category.subcategories.length > 0;

                  return (
                    <React.Fragment key={category.id}>
                      {/* Category Row */}
                      <tr
                        className="hover:bg-background/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {hasSubcategories && (
                            <button
                              onClick={() => toggleCategory(category.id)}
                              className="p-1 hover:bg-accent/20 rounded transition-colors"
                            >
                              <Icons.chevronRight
                                size={18}
                                className={`transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {category.iconImage ? (
                              <img
                                src={category.iconImage}
                                alt={category.name}
                                className="w-10 h-10 rounded-lg object-cover border border-primary/10"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (placeholder) placeholder.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center"
                              style={{ display: category.iconImage ? 'none' : 'flex' }}
                            >
                              <Icons.categories
                                size={20}
                                className="text-accent"
                              />
                            </div>
                            <span className="font-semibold text-primary">
                              {category.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-primary">
                          {category.order}
                        </td>
                        <td className="px-6 py-4 text-sm text-primary">
                          {category.searchCount}
                        </td>
                        <td className="px-6 py-4 text-sm text-primary">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/20 text-primary">
                            {category.subcategories?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-primary">
                          <div className="flex flex-col gap-1">
                            <CreatedByCell userId={category.createdBy} fetchUserName={fetchUserName} />
                            {category.createdAt && (
                              <span className="text-xs text-secondary">
                                {formatTimestamp(category.createdAt)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-primary">
                          {category.updatedBy ? (
                            <div className="flex flex-col gap-1">
                              <CreatedByCell userId={category.updatedBy} fetchUserName={fetchUserName} />
                              {category.updatedAt && (
                                <span className="text-xs text-secondary">
                                  {formatTimestamp(category.updatedAt)}
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
                              onClick={() => handleAddSubcategory(category.id)}
                              className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
                              title="Add Subcategory"
                            >
                              <Icons.plus size={18} />
                            </button>
                            <button
                              onClick={() => handleViewCategory(category.id)}
                              className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                              title="View"
                            >
                              <Icons.eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditCategory(category.id)}
                              className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer"
                              title="Edit"
                            >
                              <Icons.edit size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCategoryClick(category)
                              }
                              className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Icons.trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Subcategories Rows */}
                      {isExpanded &&
                        hasSubcategories &&
                        category.subcategories!.map((subcategory) => (
                          <tr
                            key={`${category.id}-${subcategory.id}`}
                            className="bg-background/30 hover:bg-background/50 transition-colors"
                          >
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2 ml-8">
                                <Icons.chevronRight
                                  size={14}
                                  className="text-secondary"
                                />
                                <span className="text-sm text-primary">
                                  {subcategory.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sm text-primary">
                              {subcategory.order}
                            </td>
                            <td className="px-6 py-3 text-sm text-primary">
                              {subcategory.searchCount}
                            </td>
                            <td className="px-6 py-3 text-sm text-secondary">
                              -
                            </td>
                            <td className="px-6 py-3 text-sm text-primary">
                              <div className="flex flex-col gap-1">
                                <CreatedByCell userId={subcategory.createdBy} fetchUserName={fetchUserName} />
                                {subcategory.createdAt && (
                                  <span className="text-xs text-secondary">
                                    {formatTimestamp(subcategory.createdAt)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sm text-primary">
                              {subcategory.updatedBy ? (
                                <div className="flex flex-col gap-1">
                                  <CreatedByCell userId={subcategory.updatedBy} fetchUserName={fetchUserName} />
                                  {subcategory.updatedAt && (
                                    <span className="text-xs text-secondary">
                                      {formatTimestamp(subcategory.updatedAt)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-secondary text-xs">Not updated</span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    handleEditSubcategory(
                                      category.id,
                                      subcategory.id
                                    )
                                  }
                                  className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer"
                                  title="Edit"
                                >
                                  <Icons.edit size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteSubcategoryClick(
                                      category.id,
                                      subcategory
                                    )
                                  }
                                  className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
                                  title="Delete"
                                >
                                  <Icons.trash size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {!loading && filteredAndSortedCategories.length === 0 && categories.length > 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.search size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No categories found</h3>
            <p className="text-secondary mb-4">
              No categories match your current filters. Try adjusting your search or filters.
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
        {!loading && categories.length === 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.categories size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No categories yet</h3>
            <p className="text-secondary mb-4">
              There are no categories in the system. Add your first category to get started.
            </p>
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all inline-flex items-center gap-2"
            >
              <Icons.plus size={20} />
              <span>Add Category</span>
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() =>
            setDeleteModal({
              isOpen: false,
              type: 'category',
              categoryId: null,
              subcategoryId: null,
              name: '',
            })
          }
          onConfirm={handleDeleteConfirm}
          title={`Delete ${
            deleteModal.type === 'category' ? 'Category' : 'Subcategory'
          }`}
          message={`Are you sure you want to delete "${deleteModal.name}"? ${
            deleteModal.type === 'category'
              ? 'This will also delete all subcategories.'
              : 'This action cannot be undone.'
          }`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
