'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { useCategoriesTrash } from '@/lib/hooks/useCategoriesTrash';
import { exportCategories, ExportFormat } from '@/lib/utils/exportCategories';

// Import trash components
import TrashPageHeader from '@/components/categories/trash/TrashPageHeader';
import TrashSearchFilterBar from '@/components/categories/trash/TrashSearchFilterBar';
import TrashStatsCards from '@/components/categories/trash/TrashStatsCards';
import TrashTable from '@/components/categories/trash/TrashTable';
import TrashEmptyState from '@/components/categories/trash/TrashEmptyState';
import OrphanedSubcategoryRow from '@/components/categories/trash/OrphanedSubcategoryRow';
import SortableHeader from '@/components/categories/trash/SortableHeader';

export default function CategoriesTrashPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories');
  
  const {
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
  } = useCategoriesTrash();

  // Handle view
  const handleView = (category: Category) => {
    window.open(`/categories/view/${category.id}`, '_blank');
  };

  // Handle export
  const handleExport = (format: ExportFormat, type: 'categories' | 'subcategories') => {
    if (type === 'categories') {
      exportCategories(format, {
        categories: deletedCategories,
        userCache,
        formatTimestamp,
      });
    } else {
      // Export orphaned subcategories as simple data
      const subcategoriesData = orphanedSubcategories.map(item => {
        const deletedByUser = item.subcategory.deletedBy ? userCache[item.subcategory.deletedBy] : null;
        const createdByUser = userCache[item.subcategory.createdBy] || null;
        const updatedByUser = item.subcategory.updatedBy ? userCache[item.subcategory.updatedBy] : null;
        
        return {
          name: item.subcategory.name,
          parentCategory: item.categoryName,
          order: item.subcategory.order,
          searchCount: item.subcategory.searchCount,
          createdBy: createdByUser?.name || 'Unknown',
          createdAt: formatTimestamp(item.subcategory.createdAt) || '',
          updatedBy: updatedByUser?.name || 'Not updated',
          updatedAt: item.subcategory.updatedAt ? formatTimestamp(item.subcategory.updatedAt) || '' : '',
          deletedBy: deletedByUser?.name || 'Unknown',
          deletedAt: formatTimestamp(item.subcategory.deletedAt) || '',
        };
      });
      
      if (format === 'csv') {
        // Export as CSV
        const headers = ['Name', 'Parent Category', 'Order', 'Search Count', 'Created By', 'Created At', 'Updated By', 'Updated At', 'Deleted By', 'Deleted At'];
        const csvContent = [
          headers.join(','),
          ...subcategoriesData.map(row => 
            [row.name, row.parentCategory, row.order, row.searchCount, row.createdBy, row.createdAt, row.updatedBy, row.updatedAt, row.deletedBy, row.deletedAt]
              .map(val => `"${val}"`)
              .join(',')
          )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deleted-subcategories-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Export as JSON
        const blob = new Blob([JSON.stringify(subcategoriesData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deleted-subcategories-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    }
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
            { label: 'Categories', href: '/categories' },
            { label: 'Trash' },
          ]}
        />

        {/* Page Header */}
        <TrashPageHeader 
          totalCategories={filteredAndSortedCategories.length} 
          totalSubcategories={filteredOrphanedSubcategories.length}
          onExport={handleExport} 
        />

        {/* Search and Filter Bar */}
        <TrashSearchFilterBar
          searchQuery={searchQuery}
          hasActiveFilters={hasActiveFilters}
          totalCategories={deletedCategories.length}
          filteredCount={filteredAndSortedCategories.length}
          onSearchChange={setSearchQuery}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <TrashStatsCards categories={deletedCategories} />

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-primary/10">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'categories'
                  ? 'bg-accent/50 text-primary'
                  : 'text-secondary hover:bg-background'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icons.categories size={20} />
                <span>Deleted Categories</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-secondary/20">
                  {filteredAndSortedCategories.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('subcategories')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'subcategories'
                  ? 'bg-accent text-primary'
                  : 'text-secondary hover:bg-background'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icons.file size={20} />
                <span>Deleted Subcategories</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-secondary/20">
                  {filteredOrphanedSubcategories.length}
                </span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                {filteredAndSortedCategories.length > 0 ? (
                  <TrashTable
                    categories={filteredAndSortedCategories}
                    userCache={userCache}
                    expandedCategories={expandedCategories}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    formatTimestamp={formatTimestamp}
                    onSort={handleSort}
                    onToggle={toggleCategory}
                    onView={handleView}
                    onRestore={handleRestoreClick}
                    onPermanentDelete={handlePermanentDeleteClick}
                  />
                ) : (
                  <TrashEmptyState
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                  />
                )}
              </div>
            )}

            {/* Subcategories Tab */}
            {activeTab === 'subcategories' && (
              <div className="space-y-4">
                {filteredOrphanedSubcategories.length > 0 ? (
                  <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-background border-b border-primary/10">
                          <tr>
                            {/* Empty Toggle Column */}
                            <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body w-12"></th>
                            {/* Name */}
                            <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                              <SortableHeader
                                field="name"
                                label="Name"
                                currentSortField={sortField}
                                currentSortOrder={sortOrder}
                                onSort={handleSort}
                              />
                            </th>
                            {/* Order */}
                            <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                              <SortableHeader
                                field="order"
                                label="Order"
                                currentSortField={sortField}
                                currentSortOrder={sortOrder}
                                onSort={handleSort}
                              />
                            </th>
                            {/* Search Count */}
                            <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                              <SortableHeader
                                field="searchCount"
                                label="Search Count"
                                currentSortField={sortField}
                                currentSortOrder={sortOrder}
                                onSort={handleSort}
                              />
                            </th>
                            {/* Created By */}
                            <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                              Created By
                            </th>
                            {/* Updated By */}
                            <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                              Updated By
                            </th>
                            {/* Deleted By */}
                            <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                              <SortableHeader
                                field="deletedAt"
                                label="Deleted By"
                                currentSortField={sortField}
                                currentSortOrder={sortOrder}
                                onSort={handleSort}
                              />
                            </th>
                            {/* Actions */}
                            <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrphanedSubcategories.map((item, index) => (
                            <OrphanedSubcategoryRow
                              key={`${item.categoryId}-${item.subcategory.id}`}
                              categoryId={item.categoryId}
                              categoryName={item.categoryName}
                              subcategory={item.subcategory}
                              index={index}
                              userCache={userCache}
                              formatTimestamp={formatTimestamp}
                              onRestore={handleRestoreSubcategoryClick}
                              onPermanentDelete={handlePermanentDeleteSubcategoryClick}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                        <Icons.file size={32} className="text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-primary font-heading mb-2">
                          No Deleted Subcategories
                        </h3>
                        <p className="text-secondary font-body">
                          Deleted subcategories (with active parent categories) will appear here
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      <ConfirmModal
        isOpen={restoreModal.isOpen}
        onClose={() => setRestoreModal({ isOpen: false, category: null })}
        onConfirm={handleRestoreConfirm}
        title="Restore Category"
        message={`Are you sure you want to restore "${restoreModal.category?.name}"? This category and all its subcategories will be moved back to the active categories list.`}
        confirmText="Restore"
        type="warning"
      />

      {/* Permanent Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={permanentDeleteModal.isOpen}
        onClose={() => setPermanentDeleteModal({ isOpen: false, category: null })}
        onConfirm={handlePermanentDeleteConfirm}
        title="Permanently Delete Category"
        message={`Are you sure you want to permanently delete "${permanentDeleteModal.category?.name}"? This action cannot be undone and will also delete all subcategories and the category icon.`}
        confirmText="Permanently Delete"
        type="danger"
      />

      {/* Restore Subcategory Confirmation Modal */}
      <ConfirmModal
        isOpen={restoreSubcategoryModal.isOpen}
        onClose={() => setRestoreSubcategoryModal({ isOpen: false, categoryId: null, categoryName: null, subcategory: null })}
        onConfirm={handleRestoreSubcategoryConfirm}
        title="Restore Subcategory"
        message={`Are you sure you want to restore "${restoreSubcategoryModal.subcategory?.name}" back to category "${restoreSubcategoryModal.categoryName}"?`}
        confirmText="Restore"
        type="warning"
      />

      {/* Permanent Delete Subcategory Confirmation Modal */}
      <ConfirmModal
        isOpen={permanentDeleteSubcategoryModal.isOpen}
        onClose={() => setPermanentDeleteSubcategoryModal({ isOpen: false, categoryId: null, categoryName: null, subcategory: null })}
        onConfirm={handlePermanentDeleteSubcategoryConfirm}
        title="Permanently Delete Subcategory"
        message={`Are you sure you want to permanently delete "${permanentDeleteSubcategoryModal.subcategory?.name}" from category "${permanentDeleteSubcategoryModal.categoryName}"? This action cannot be undone.`}
        confirmText="Permanently Delete"
        type="danger"
      />
    </AdminLayout>
  );
}
