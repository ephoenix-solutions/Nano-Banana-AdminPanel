'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { useUserGenerationsList } from '@/lib/hooks/useUserGenerationsList';
import { exportUserGenerations, ExportFormat } from '@/lib/utils/exportUserGenerations';

// Import list components
import PageHeader from '@/components/user-generations/list/PageHeader';
import SearchFilterBar from '@/components/user-generations/list/SearchFilterBar';
import StatsCards from '@/components/user-generations/list/StatsCards';
import GenerationsTable from '@/components/user-generations/list/GenerationsTable';
import EmptyState from '@/components/user-generations/list/EmptyState';
import ErrorMessage from '@/components/user-generations/list/ErrorMessage';

export default function UserGenerationsPage() {
  const {
    // Data
    generations,
    filteredAndSortedGenerations,
    userCache,
    planCache,
    
    // Loading states
    loading,
    error,
    
    // Filter states
    searchQuery,
    sortField,
    sortOrder,
    statusFilter,
    userFilter,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setStatusFilter,
    setUserFilter,
    handleSort,
    clearFilters,
    
    // CRUD operations
    handleView,
    handleDeleteClick,
    handleDeleteConfirm,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    formatTimestamp,
    getStatusColor,
    getStatusBadge,
  } = useUserGenerationsList();

  // Get unique users for filter dropdown
  const uniqueUsers = Object.values(userCache);

  // Handle export
  const handleExport = (format: ExportFormat) => {
    exportUserGenerations(format, {
      generations: filteredAndSortedGenerations,
      userCache,
      planCache,
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
        <Breadcrumbs items={[{ label: 'User Generations' }]} />

        {/* Page Header */}
        <PageHeader onExport={handleExport} totalGenerations={filteredAndSortedGenerations.length} />

        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          userFilter={userFilter}
          users={uniqueUsers}
          hasActiveFilters={hasActiveFilters}
          totalGenerations={generations.length}
          filteredCount={filteredAndSortedGenerations.length}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onUserChange={setUserFilter}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <StatsCards generations={generations} />

        {/* Error Message */}
        <ErrorMessage message={error} />

        {/* Generations Table - Only show if there are results */}
        {filteredAndSortedGenerations.length > 0 && (
          <GenerationsTable
            generations={filteredAndSortedGenerations}
            userCache={userCache}
            planCache={planCache}
            sortField={sortField}
            sortOrder={sortOrder}
            formatTimestamp={formatTimestamp}
            getStatusColor={getStatusColor}
            getStatusBadge={getStatusBadge}
            onSort={handleSort}
            onView={handleView}
            onDelete={handleDeleteClick}
          />
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {filteredAndSortedGenerations.length === 0 && generations.length > 0 && (
          <EmptyState type="no-results" onClearFilters={clearFilters} />
        )}

        {/* No Data Message - Show when database is truly empty */}
        {generations.length === 0 && (
          <EmptyState type="no-data" />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, generation: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Generation"
          message="Are you sure you want to delete this generation record? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
