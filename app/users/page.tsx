'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { useUsersList } from '@/lib/hooks/useUsersList';
import { exportUsers, ExportFormat } from '@/lib/utils/exportUsers';

// Import list components
import PageHeader from '@/components/users/list/PageHeader';
import SearchFilterBar from '@/components/users/list/SearchFilterBar';
import StatsCards from '@/components/users/list/StatsCards';
import UsersTable from '@/components/users/list/UsersTable';
import EmptyState from '@/components/users/list/EmptyState';
import ErrorMessage from '@/components/users/list/ErrorMessage';

export default function UsersPage() {
  const {
    // Data
    users,
    paginatedUsers,
    userCache,
    
    // Loading states
    loading,
    
    // Filter states
    searchQuery,
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
    handleAddUser,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    formatTimestamp,
  } = useUsersList();

  // Handle export
  const handleExport = (format: ExportFormat) => {
    exportUsers(format, {
      users: users,
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
        <Breadcrumbs items={[{ label: 'Users' }]} />

        {/* Page Header */}
        <PageHeader onAddUser={handleAddUser} onExport={handleExport} totalUsers={users.length} />

        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          roleFilter={roleFilter}
          providerFilter={providerFilter}
          hasActiveFilters={hasActiveFilters}
          totalUsers={users.length}
          filteredCount={paginatedUsers.length}
          onSearchChange={setSearchQuery}
          onRoleChange={setRoleFilter}
          onProviderChange={setProviderFilter}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <StatsCards users={users} />

        {/* Users Table - Only show if there are results */}
        {paginatedUsers.length > 0 && (
          <>
            <UsersTable
              users={paginatedUsers}
              userCache={userCache}
              sortField={sortField}
              sortOrder={sortOrder}
              formatTimestamp={formatTimestamp}
              onSort={handleSort}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </>
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {paginatedUsers.length === 0 && hasActiveFilters && (
          <EmptyState type="no-results" onClearFilters={clearFilters} />
        )}

        {/* No Data Message - Show when database is truly empty */}
        {paginatedUsers.length === 0 && !hasActiveFilters && (
          <EmptyState type="no-data" onAddUser={handleAddUser} />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, user: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete ${deleteModal.user?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
