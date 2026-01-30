'use client';

import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { useUsersTrash } from '@/lib/hooks/useUsersTrash';
import { exportUsers, ExportFormat } from '@/lib/utils/exportUsers';

// Import trash components
import TrashPageHeader from '@/components/users/trash/TrashPageHeader';
import TrashSearchFilterBar from '@/components/users/trash/TrashSearchFilterBar';
import TrashStatsCards from '@/components/users/trash/TrashStatsCards';
import TrashTable from '@/components/users/trash/TrashTable';
import TrashEmptyState from '@/components/users/trash/TrashEmptyState';
import { User } from '@/lib/types/user.types';


export default function UsersTrashPage() {
  const router = useRouter();
  
  const {
    // Data
    deletedUsers,
    filteredAndSortedUsers,
    paginatedUsers,
    userCache,
    
    // Loading states
    loading,
    
    // Filter states
    searchQuery,
    debouncedSearchQuery,
    sortField,
    sortOrder,
    roleFilter,
    providerFilter,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setRoleFilter,
    setProviderFilter,
    handleSort,
    clearFilters,
    
    // CRUD operations
    handleRestore,
    handlePermanentDelete,
    handleRestoreConfirm,
    handlePermanentDeleteConfirm,
    
    // Modal states
    restoreModal,
    permanentDeleteModal,
    setRestoreModal,
    setPermanentDeleteModal,
    
    // Delete progress states
    deleteProgress,
    isDeleting,
    
    // Utilities
    formatTimestamp,
    getDeletedById,
  } = useUsersTrash();

  // Handle view
  const handleView = (user: User) => {
    router.push(`/users/view/${user.id}?from=trash`);
  };


  // Handle export
  const handleExport = (format: ExportFormat) => {
    exportUsers(format, {
      users: deletedUsers,
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
            { label: 'Users', href: '/users' },
            { label: 'Trash' },
          ]}
        />

        {/* Page Header */}
        <TrashPageHeader totalUsers={filteredAndSortedUsers.length} onExport={handleExport} />

        {/* Search and Filter Bar */}
        <TrashSearchFilterBar
          searchQuery={searchQuery}
          debouncedSearchQuery={debouncedSearchQuery}
          roleFilter={roleFilter}
          providerFilter={providerFilter}
          hasActiveFilters={hasActiveFilters}
          totalUsers={deletedUsers.length}
          filteredCount={filteredAndSortedUsers.length}
          onSearchChange={setSearchQuery}
          onRoleChange={setRoleFilter}
          onProviderChange={setProviderFilter}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <TrashStatsCards users={deletedUsers} />

        {/* Users Table - Only show if there are results */}
        {paginatedUsers.length > 0 && (
          <>
            <TrashTable
              users={paginatedUsers}
              userCache={userCache}
              sortField={sortField}
              sortOrder={sortOrder}
              formatTimestamp={formatTimestamp}
              getDeletedById={getDeletedById}
              onSort={handleSort}
              onView={handleView}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
            />
          </>
        )}

        {/* Empty State */}
        {paginatedUsers.length === 0 && (
          <TrashEmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        )}
      </div>

      {/* Restore Confirmation Modal */}
      <ConfirmModal
        isOpen={restoreModal.isOpen}
        onClose={() => setRestoreModal({ isOpen: false, user: null })}
        onConfirm={handleRestoreConfirm}
        title="Restore User"
        message={`Are you sure you want to restore "${restoreModal.user?.name}"? This user will be moved back to the active users list.`}
        confirmText="Restore"
        type="warning"
      />

      {/* Permanent Delete Confirmation Modal with Loading */}
      <ConfirmModal
        isOpen={permanentDeleteModal.isOpen}
        onClose={() => {
          if (!isDeleting) {
            setPermanentDeleteModal({ isOpen: false, user: null });
          }
        }}
        onConfirm={handlePermanentDeleteConfirm}
        title="Permanently Delete User"
        message={`Are you sure you want to permanently delete "${permanentDeleteModal.user?.name}"? This action cannot be undone and all user data will be lost forever.`}
        confirmText="Permanently Delete"
        type="danger"
        isLoading={isDeleting}
        progress={deleteProgress}
      />
    </AdminLayout>
  );
}
