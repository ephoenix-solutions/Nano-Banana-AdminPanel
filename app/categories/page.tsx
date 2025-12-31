'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import CategoryDeleteModal from '@/components/categories/utils/CategoryDeleteModal';
import { useCategoriesList } from '@/lib/hooks/useCategoriesList';

// Import list components
import PageHeader from '@/components/categories/list/PageHeader';
import SearchFilterBar from '@/components/categories/list/SearchFilterBar';
import StatsCards from '@/components/categories/list/StatsCards';
import CategoriesTable from '@/components/categories/list/CategoriesTable';
import EmptyState from '@/components/categories/list/EmptyState';
import ErrorMessage from '@/components/categories/list/ErrorMessage';

export default function CategoriesPage() {
  const {
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
  } = useCategoriesList();

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
        <PageHeader onAddCategory={handleAddCategory} />

        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          subcategoryFilter={subcategoryFilter}
          hasActiveFilters={hasActiveFilters}
          totalCategories={categories.length}
          filteredCount={filteredAndSortedCategories.length}
          onSearchChange={setSearchQuery}
          onSubcategoryFilterChange={setSubcategoryFilter}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <StatsCards categories={categories} />

        {/* Error Message */}
        <ErrorMessage message={error} />

        {/* Categories Table - Only show if there are results */}
        {filteredAndSortedCategories.length > 0 && (
          <CategoriesTable
            categories={filteredAndSortedCategories}
            userCache={userCache}
            expandedCategories={expandedCategories}
            sortField={sortField}
            sortOrder={sortOrder}
            formatTimestamp={formatTimestamp}
            onSort={handleSort}
            onToggle={toggleCategory}
            onView={handleViewCategory}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategoryClick}
            onAddSubcategory={handleAddSubcategory}
            onEditSubcategory={handleEditSubcategory}
            onDeleteSubcategory={handleDeleteSubcategoryClick}
          />
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {filteredAndSortedCategories.length === 0 && categories.length > 0 && (
          <EmptyState type="no-results" onClearFilters={clearFilters} />
        )}

        {/* No Data Message - Show when database is truly empty */}
        {categories.length === 0 && (
          <EmptyState type="no-data" onAddCategory={handleAddCategory} />
        )}

        {/* Category Delete Confirmation Modal with Usage Info */}
        {deleteModal.type === 'category' && (
          <CategoryDeleteModal
            isOpen={deleteModal.isOpen}
            onClose={() =>
              setDeleteModal({
                isOpen: false,
                type: 'category',
                categoryId: null,
                subcategoryId: null,
                name: '',
                promptsCount: 0,
                countries: [],
                loadingUsage: false,
              })
            }
            onConfirm={handleDeleteConfirm}
            categoryName={deleteModal.name}
            promptsCount={deleteModal.promptsCount}
            countries={deleteModal.countries}
            loadingUsage={deleteModal.loadingUsage}
          />
        )}

        {/* Subcategory Delete Confirmation Modal (Simple) */}
        {deleteModal.type === 'subcategory' && (
          <ConfirmModal
            isOpen={deleteModal.isOpen}
            onClose={() =>
              setDeleteModal({
                isOpen: false,
                type: 'category',
                categoryId: null,
                subcategoryId: null,
                name: '',
                promptsCount: 0,
                countries: [],
                loadingUsage: false,
              })
            }
            onConfirm={handleDeleteConfirm}
            title="Delete Subcategory"
            message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        )}
      </div>
    </AdminLayout>
  );
}
