'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Prompt } from '@/lib/types/prompt.types';
import { usePromptsTrash } from '@/lib/hooks/usePromptsTrash';
import { exportPrompts, ExportFormat } from '@/lib/utils/exportPrompts';

// Import trash components
import TrashPageHeader from '@/components/prompts/trash/TrashPageHeader';
import TrashSearchFilterBar from '@/components/prompts/trash/TrashSearchFilterBar';
import TrashStatsCards from '@/components/prompts/trash/TrashStatsCards';
import TrashTable from '@/components/prompts/trash/TrashTable';
import TrashEmptyState from '@/components/prompts/trash/TrashEmptyState';

export default function PromptsTrashPage() {
  const {
    // Data
    deletedPrompts,
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
  } = usePromptsTrash();

  // Handle export
  const handleExport = (format: ExportFormat) => {
    exportPrompts(format, {
      prompts: deletedPrompts,
      userCache,
      getCategoryName,
      getSubcategoryName,
      formatTimestamp,
    });
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
        <Breadcrumbs
          items={[
            { label: 'Prompts', href: '/prompts' },
            { label: 'Trash' },
          ]}
        />

        {/* Page Header */}
        <TrashPageHeader totalPrompts={filteredAndSortedPrompts.length} onExport={handleExport} />

        {/* Search and Filter Bar */}
        <TrashSearchFilterBar
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          categories={categories}
          hasActiveFilters={hasActiveFilters}
          totalPrompts={deletedPrompts.length}
          filteredCount={filteredAndSortedPrompts.length}
          onSearchChange={setSearchQuery}
          onCategoryChange={setCategoryFilter}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <TrashStatsCards prompts={deletedPrompts} />

        {/* Prompts Table - Only show if there are results */}
        {filteredAndSortedPrompts.length > 0 && (
          <TrashTable
            prompts={filteredAndSortedPrompts}
            userCache={userCache}
            sortField={sortField}
            sortOrder={sortOrder}
            getCategoryName={getCategoryName}
            getSubcategoryName={getSubcategoryName}
            formatTimestamp={formatTimestamp}
            onSort={handleSort}
            onView={handleView}
            onRestore={handleRestoreClick}
            onPermanentDelete={handlePermanentDeleteClick}
          />
        )}

        {/* Empty State */}
        {filteredAndSortedPrompts.length === 0 && (
          <TrashEmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        )}
      </div>

      {/* Restore Confirmation Modal */}
      <ConfirmModal
        isOpen={restoreModal.isOpen}
        onClose={() => setRestoreModal({ isOpen: false, prompt: null })}
        onConfirm={handleRestoreConfirm}
        title="Restore Prompt"
        message={`Are you sure you want to restore "${restoreModal.prompt?.title}"? This prompt will be moved back to the active prompts list.`}
        confirmText="Restore"
        type="warning"
      />

      {/* Permanent Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={permanentDeleteModal.isOpen}
        onClose={() => setPermanentDeleteModal({ isOpen: false, prompt: null })}
        onConfirm={handlePermanentDeleteConfirm}
        title="Permanently Delete Prompt"
        message={`Are you sure you want to permanently delete "${permanentDeleteModal.prompt?.title}"? This action cannot be undone and will also delete the associated image.`}
        confirmText="Permanently Delete"
        type="danger"
      />
    </AdminLayout>
  );
}
