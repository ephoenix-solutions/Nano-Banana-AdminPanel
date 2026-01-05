'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { useUsersList } from '@/lib/hooks/useUsersList';

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
    filteredAndSortedUsers,
    userCache,
    
    // Loading states
    loading,
    error,
    
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
        <PageHeader onAddUser={handleAddUser} />

        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          roleFilter={roleFilter}
          providerFilter={providerFilter}
          hasActiveFilters={hasActiveFilters}
          totalUsers={users.length}
          filteredCount={filteredAndSortedUsers.length}
          onSearchChange={setSearchQuery}
          onRoleChange={setRoleFilter}
          onProviderChange={setProviderFilter}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <StatsCards users={users} />

        {/* Error Message */}
        <ErrorMessage message={error} />

        {/* Users Table - Only show if there are results */}
        {filteredAndSortedUsers.length > 0 && (
          <UsersTable
            users={filteredAndSortedUsers}
            userCache={userCache}
            sortField={sortField}
            sortOrder={sortOrder}
            formatTimestamp={formatTimestamp}
            onSort={handleSort}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {filteredAndSortedUsers.length === 0 && users.length > 0 && (
          <EmptyState type="no-results" onClearFilters={clearFilters} />
        )}

        {/* No Data Message - Show when database is truly empty */}
        {users.length === 0 && (
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
