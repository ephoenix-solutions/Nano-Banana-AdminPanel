'use client';

import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { usePromptsList } from '@/lib/hooks/usePromptsList';
import { exportPrompts, ExportFormat } from '@/lib/utils/exportPrompts';

// Import list components
import PageHeader from '@/components/prompts/list/PageHeader';
import SearchFilterBar from '@/components/prompts/list/SearchFilterBar';
import StatsCards from '@/components/prompts/list/StatsCards';
import PromptsTable from '@/components/prompts/list/PromptsTable';
import EmptyState from '@/components/prompts/list/EmptyState';
import ErrorMessage from '@/components/prompts/list/ErrorMessage';

export default function PromptsPage() {
  const router = useRouter();
  
  const {
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
  } = usePromptsList();

  // Handle export
  const handleExport = (format: ExportFormat) => {
    exportPrompts(format, {
      prompts: filteredAndSortedPrompts,
      userCache,
      getCategoryName,
      getSubcategoryName,
      formatTimestamp,
    });
  };

  // Handle import
  const handleImport = () => {
    router.push('/prompts/import');
  };

  // Handle view trash
  const handleViewTrash = () => {
    router.push('/prompts/trash');
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
        <PageHeader onAddPrompt={handleAddPrompt} onExport={handleExport} onImport={handleImport} onViewTrash={handleViewTrash} totalPrompts={filteredAndSortedPrompts.length} />

        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          subcategoryFilter={subcategoryFilter}
          trendingFilter={trendingFilter}
          categories={categories}
          availableSubcategories={availableSubcategories}
          hasActiveFilters={hasActiveFilters}
          totalPrompts={prompts.length}
          filteredCount={filteredAndSortedPrompts.length}
          onSearchChange={setSearchQuery}
          onCategoryChange={setCategoryFilter}
          onSubcategoryChange={setSubcategoryFilter}
          onTrendingChange={setTrendingFilter}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <StatsCards prompts={prompts} />

        {/* Prompts Table - Only show if there are results */}
        {filteredAndSortedPrompts.length > 0 && (
          <PromptsTable
            prompts={filteredAndSortedPrompts}
            userCache={userCache}
            sortField={sortField}
            sortOrder={sortOrder}
            getCategoryName={getCategoryName}
            getSubcategoryName={getSubcategoryName}
            formatTimestamp={formatTimestamp}
            onSort={handleSort}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onToggleTrending={handleToggleTrending}
          />
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {filteredAndSortedPrompts.length === 0 && prompts.length > 0 && (
          <EmptyState type="no-results" onClearFilters={clearFilters} />
        )}

        {/* No Data Message - Show when database is truly empty */}
        {prompts.length === 0 && (
          <EmptyState type="no-data" onAddPrompt={handleAddPrompt} />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, prompt: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Prompt"
          message="Are you sure you want to delete this prompt? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
