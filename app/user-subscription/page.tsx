'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { useUserSubscriptionsList } from '@/lib/hooks/useUserSubscriptionsList';
import { exportUserSubscriptions, ExportFormat } from '@/lib/utils/exportUserSubscriptions';

// Import list components
import PageHeader from '@/components/user-subscription/list/PageHeader';
import SearchFilterBar from '@/components/user-subscription/list/SearchFilterBar';
import StatsCards from '@/components/user-subscription/list/StatsCards';
import SubscriptionsTable from '@/components/user-subscription/list/SubscriptionsTable';
import EmptyState from '@/components/user-subscription/list/EmptyState';
import ErrorMessage from '@/components/user-subscription/list/ErrorMessage';

export default function UserSubscriptionsPage() {
  const {
    // Data
    subscriptions,
    plans,
    filteredAndSortedSubscriptions,
    
    // Loading states
    loading,
    error,
    
    // Filter states
    searchQuery,
    sortField,
    sortOrder,
    planFilter,
    statusFilter,
    paymentMethodFilter,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setPlanFilter,
    setStatusFilter,
    setPaymentMethodFilter,
    handleSort,
    clearFilters,
    
    // CRUD operations
    handleDeleteClick,
    handleDeleteConfirm,
    handleToggleActive,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    getUserName,
    getPlanName,
    formatTimestamp,
    isExpired,
  } = useUserSubscriptionsList();

  // Handle export
  const handleExport = (format: ExportFormat) => {
    exportUserSubscriptions(format, {
      subscriptions: filteredAndSortedSubscriptions,
      getUserName,
      getPlanName,
      formatTimestamp,
      isExpired,
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
        <Breadcrumbs items={[{ label: 'User Subscriptions' }]} />

        {/* Page Header */}
        <PageHeader onExport={handleExport} totalSubscriptions={filteredAndSortedSubscriptions.length} />

        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          planFilter={planFilter}
          statusFilter={statusFilter}
          paymentMethodFilter={paymentMethodFilter}
          plans={plans}
          hasActiveFilters={hasActiveFilters}
          totalSubscriptions={subscriptions.length}
          filteredCount={filteredAndSortedSubscriptions.length}
          onSearchChange={setSearchQuery}
          onPlanChange={setPlanFilter}
          onStatusChange={setStatusFilter}
          onPaymentMethodChange={setPaymentMethodFilter}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <StatsCards subscriptions={subscriptions} isExpired={isExpired} />

        {/* Error Message */}
        <ErrorMessage message={error} />

        {/* Subscriptions Table - Only show if there are results */}
        {filteredAndSortedSubscriptions.length > 0 && (
          <SubscriptionsTable
            subscriptions={filteredAndSortedSubscriptions}
            sortField={sortField}
            sortOrder={sortOrder}
            getUserName={getUserName}
            getPlanName={getPlanName}
            formatTimestamp={formatTimestamp}
            isExpired={isExpired}
            onSort={handleSort}
            onDelete={handleDeleteClick}
            onToggleActive={handleToggleActive}
          />
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {filteredAndSortedSubscriptions.length === 0 && subscriptions.length > 0 && (
          <EmptyState type="no-results" onClearFilters={clearFilters} />
        )}

        {/* No Data Message - Show when database is truly empty */}
        {subscriptions.length === 0 && (
          <EmptyState type="no-data" />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, subscription: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Subscription"
          message="Are you sure you want to delete this subscription? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
