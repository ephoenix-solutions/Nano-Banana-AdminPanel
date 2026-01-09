'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { useFeedbackList } from '@/lib/hooks/useFeedbackList';
import { exportFeedback, ExportFormat } from '@/lib/utils/exportFeedback';

// Import list components
import PageHeader from '@/components/feedback/list/PageHeader';
import SearchFilterBar from '@/components/feedback/list/SearchFilterBar';
import StatsCards from '@/components/feedback/list/StatsCards';
import FeedbackTable from '@/components/feedback/list/FeedbackTable';
import EmptyState from '@/components/feedback/list/EmptyState';
import ErrorMessage from '@/components/feedback/list/ErrorMessage';

export default function FeedbackPage() {
  const {
    // Data
    feedback,
    filteredAndSortedFeedback,
    userCache,
    
    // Loading states
    loading,
    error,
    
    // Filter states
    searchQuery,
    sortField,
    sortOrder,
    ratingFilter,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setRatingFilter,
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
    getAverageRating,
    getRatingCount,
  } = useFeedbackList();

  // Handle export
  const handleExport = (format: ExportFormat) => {
    exportFeedback(format, {
      feedback: filteredAndSortedFeedback,
      userCache,
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
        <Breadcrumbs items={[{ label: 'Feedback' }]} />

        {/* Page Header */}
        <PageHeader onExport={handleExport} totalFeedback={filteredAndSortedFeedback.length} />

        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          ratingFilter={ratingFilter}
          hasActiveFilters={hasActiveFilters}
          totalFeedback={feedback.length}
          filteredCount={filteredAndSortedFeedback.length}
          onSearchChange={setSearchQuery}
          onRatingChange={setRatingFilter}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <StatsCards
          feedback={feedback}
          getAverageRating={getAverageRating}
          getRatingCount={getRatingCount}
        />

        {/* Error Message */}
        <ErrorMessage message={error} />

        {/* Feedback Table - Only show if there are results */}
        {filteredAndSortedFeedback.length > 0 && (
          <FeedbackTable
            feedback={filteredAndSortedFeedback}
            userCache={userCache}
            sortField={sortField}
            sortOrder={sortOrder}
            formatTimestamp={formatTimestamp}
            onSort={handleSort}
            onView={handleView}
            onDelete={handleDeleteClick}
          />
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {filteredAndSortedFeedback.length === 0 && feedback.length > 0 && (
          <EmptyState type="no-results" onClearFilters={clearFilters} />
        )}

        {/* No Data Message - Show when database is truly empty */}
        {feedback.length === 0 && (
          <EmptyState type="no-data" />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, feedback: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Feedback"
          message="Are you sure you want to delete this feedback? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
