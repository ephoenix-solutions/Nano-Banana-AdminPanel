'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { useCountriesList } from '@/lib/hooks/useCountriesList';

// Import list components
import PageHeader from '@/components/countries/list/PageHeader';
import SearchFilterBar from '@/components/countries/list/SearchFilterBar';
import StatsCards from '@/components/countries/list/StatsCards';
import CountriesTable from '@/components/countries/list/CountriesTable';
import EmptyState from '@/components/countries/list/EmptyState';
import ErrorMessage from '@/components/countries/list/ErrorMessage';

export default function CountriesPage() {
  const {
    // Data
    countries,
    categories,
    filteredAndSortedCountries,
    
    // Loading states
    loading,
    error,
    
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
    handleAddCountry,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    getCategoryNames,
    fetchUserName,
    formatTimestamp,
  } = useCountriesList();

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
        <Breadcrumbs items={[{ label: 'Countries' }]} />

        {/* Page Header */}
        <PageHeader onAddCountry={handleAddCountry} />

        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          categories={categories}
          hasActiveFilters={hasActiveFilters}
          totalCountries={countries.length}
          filteredCount={filteredAndSortedCountries.length}
          onSearchChange={setSearchQuery}
          onCategoryChange={setCategoryFilter}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <StatsCards countries={countries} />

        {/* Error Message */}
        <ErrorMessage message={error} />

        {/* Countries Table - Only show if there are results */}
        {filteredAndSortedCountries.length > 0 && (
          <CountriesTable
            countries={filteredAndSortedCountries}
            sortField={sortField}
            sortOrder={sortOrder}
            getCategoryNames={getCategoryNames}
            fetchUserName={fetchUserName}
            formatTimestamp={formatTimestamp}
            onSort={handleSort}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {filteredAndSortedCountries.length === 0 && countries.length > 0 && (
          <EmptyState type="no-results" onClearFilters={clearFilters} />
        )}

        {/* No Data Message - Show when database is truly empty */}
        {countries.length === 0 && (
          <EmptyState type="no-data" onAddCountry={handleAddCountry} />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, country: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Country"
          message={`Are you sure you want to delete "${deleteModal.country?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
