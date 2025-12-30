'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { Prompt } from '@/lib/types/prompt.types';
import { Category } from '@/lib/types/category.types';
import {
  getAllPrompts,
  deletePrompt,
  toggleTrending,
} from '@/lib/services/prompt.service';
import { getAllCategories } from '@/lib/services/category.service';
import { getUserById } from '@/lib/services/user.service';

type SortField = 'title' | 'likes' | 'createdAt' | 'searchCount' | 'saveCount' | 'category' | 'updatedAt';
type SortOrder = 'asc' | 'desc';
type TrendingFilter = 'all' | 'trending' | 'not-trending';

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

export default function PromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    prompt: Prompt | null;
  }>({
    isOpen: false,
    prompt: null,
  });

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [trendingFilter, setTrendingFilter] = useState<TrendingFilter>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [promptsData, categoriesData] = await Promise.all([
        getAllPrompts(),
        getAllCategories(),
      ]);
      setPrompts(promptsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load prompts');
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
      await deletePrompt(deleteModal.prompt.id);
      await fetchData();
    } catch (err) {
      console.error('Error deleting prompt:', err);
      setError('Failed to delete prompt');
    }
  };

  const handleToggleTrending = async (promptId: string, isTrending: boolean) => {
    try {
      await toggleTrending(promptId, !isTrending);
      await fetchData();
    } catch (err) {
      console.error('Error toggling trending:', err);
      setError('Failed to update trending status');
    }
  };

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

  // Handle sorting
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
        // Check title
        if (prompt.title.toLowerCase().includes(query)) return true;
        // Check tags
        if (prompt.tags && prompt.tags.some((tag) => tag.toLowerCase().includes(query))) return true;
        // Check prompt content
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

  // Reset subcategory filter when category changes
  useEffect(() => {
    if (categoryFilter === 'all') {
      setSubcategoryFilter('all');
    }
  }, [categoryFilter]);

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
        <Breadcrumbs items={[{ label: 'Prompts' }]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Prompts
            </h1>
            <p className="text-secondary mt-2 font-body">
              Manage all AI prompts
            </p>
          </div>
          <button
            onClick={handleAddPrompt}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.plus size={20} />
            <span>Add Prompt</span>
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
                  placeholder="Search by title, tags, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary placeholder-secondary/50"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            <div className="w-full md:w-48">
              <select
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                disabled={categoryFilter === 'all'}
                className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">
                  {categoryFilter === 'all' ? 'Select category first' : 'All Subcategories'}
                </option>
                {availableSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Trending Filter */}
            <div className="w-full md:w-48">
              <select
                value={trendingFilter}
                onChange={(e) => setTrendingFilter(e.target.value as TrendingFilter)}
                className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
              >
                <option value="all">All Status</option>
                <option value="trending">Trending</option>
                <option value="not-trending">Not Trending</option>
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
              Showing <span className="font-semibold text-primary">{filteredAndSortedPrompts.length}</span> of{' '}
              <span className="font-semibold text-primary">{prompts.length}</span> prompts
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Prompts
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {prompts.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.file size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Trending
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {prompts.filter((p) => p.isTrending).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.chart size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Likes
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {prompts.reduce((sum, p) => sum + (p.likesCount || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.check size={24} className="text-accent" />
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
                  {prompts.reduce((sum, p) => sum + p.searchCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.search size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Saves
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {prompts.reduce((sum, p) => sum + (p.savesCount || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.bookmark size={24} className="text-accent" />
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

        {/* Prompts Table - Only show if there are results OR if loading */}
        {(loading || filteredAndSortedPrompts.length > 0) && (
          <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-primary/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="title" label="Title" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Required
                    </th>
                    {/* <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Tags
                    </th> */}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="category" label="Category" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Trending
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="likes" label="Likes" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="searchCount" label="Searches" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="saveCount" label="Saves" />
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
                  {filteredAndSortedPrompts.map((prompt, index) => (
                  <tr
                    key={prompt.id}
                    className={`transition-colors ${
                      index % 2 === 0
                        ? 'bg-white hover:bg-background/50'
                        : 'bg-background hover:bg-background-200'
                    }`}
                  >
                    <td className="px-6 py-4">
                      {prompt.url ? (
                        <img
                          src={prompt.url}
                          alt="Prompt preview"
                          className="w-24 h-16 rounded-lg object-cover border border-primary/10"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-24 h-16 rounded-lg bg-background border border-primary/10 flex items-center justify-center">
                          <Icons.images size={24} className="text-secondary/50" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-primary font-semibold">
                          {prompt.title || 'Untitled'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          (prompt.imageRequirement ?? 0) === -1
                            ? 'bg-secondary/20 text-secondary'
                            : (prompt.imageRequirement ?? 0) === 0
                            ? 'bg-accent/20 text-primary'
                            : 'bg-accent/30 text-primary'
                        }`}
                      >
                        {(prompt.imageRequirement ?? 0) === -1
                          ? 'None'
                          : (prompt.imageRequirement ?? 0) === 0
                          ? 'Optional'
                          : `${prompt.imageRequirement} Req.`}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {prompt.tags && prompt.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {prompt.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                            {prompt.tags.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/20 text-primary">
                                +{prompt.tags.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-secondary/50">No tags</span>
                        )}
                      </div>
                    </td> */}
                    <td className="px-6 py-4 text-sm text-primary">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{getCategoryName(prompt.categoryId)}</span>
                        <span className="text-xs text-secondary flex items-center gap-1">
                          <Icons.cornerDownRight size={12} />
                          {getSubcategoryName(prompt.categoryId, prompt.subCategoryId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleTrending(prompt.id, prompt.isTrending)
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 cursor-pointer ${
                          prompt.isTrending
                            ? 'bg-accent'
                            : 'bg-secondary/30'
                        }`}
                        title={prompt.isTrending ? 'Trending' : 'Not Trending'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            prompt.isTrending ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
                        {prompt.likesCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/20 text-primary">
                        {prompt.searchCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
                        <Icons.bookmark size={12} />
                        {prompt.savesCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      <div className="flex flex-col gap-1">
                        <CreatedByCell userId={prompt.createdBy} fetchUserName={fetchUserName} />
                        {prompt.createdAt && (
                          <span className="text-xs text-secondary">
                            {formatTimestamp(prompt.createdAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      {prompt.updatedBy ? (
                        <div className="flex flex-col gap-1">
                          <CreatedByCell userId={prompt.updatedBy} fetchUserName={fetchUserName} />
                          {prompt.updatedAt && (
                            <span className="text-xs text-secondary">
                              {formatTimestamp(prompt.updatedAt)}
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
                          onClick={() => handleView(prompt)}
                          className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                          title="View"
                        >
                          <Icons.eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(prompt)}
                          className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer"
                          title="Edit"
                        >
                          <Icons.edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(prompt)}
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
        {!loading && filteredAndSortedPrompts.length === 0 && prompts.length > 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.search size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No prompts found</h3>
            <p className="text-secondary mb-4">
              No prompts match your current filters. Try adjusting your search or filters.
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
        {!loading && prompts.length === 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.file size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No prompts yet</h3>
            <p className="text-secondary mb-4">
              There are no prompts in the system. Add your first prompt to get started.
            </p>
            <button
              onClick={handleAddPrompt}
              className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all inline-flex items-center gap-2"
            >
              <Icons.plus size={20} />
              <span>Add Prompt</span>
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, prompt: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Prompt"
          message={`Are you sure you want to delete this prompt? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
