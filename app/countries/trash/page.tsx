'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { useCountriesTrash } from '@/lib/hooks/useCountriesTrash';
import { useRouter } from 'next/navigation';

// Import trash components
import TrashPageHeader from '@/components/countries/trash/TrashPageHeader';
import TrashSearchFilterBar from '@/components/countries/trash/TrashSearchFilterBar';
import TrashStatsCards from '@/components/countries/trash/TrashStatsCards';
import TrashTable from '@/components/countries/trash/TrashTable';
import TrashEmptyState from '@/components/countries/trash/TrashEmptyState';
import { Country } from '@/lib/types/country.types';

export default function CountriesTrashPage() {
  const {
    // Data
    deletedCountries,
    categories,
    filteredAndSortedCountries,
    userCache,
    
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
    
    // CRUD operations
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
    getCategoryNames,
    formatTimestamp,
  } = useCountriesTrash();

  const router = useRouter();

  // Handle view
  const handleView = (country: Country) => {
    router.push(`/countries/view/${country.id}?from=trash`);
  };

  // Handle export
  const handleExport = (format: 'csv' | 'json') => {
    const countriesData = deletedCountries.map(country => {
      const deletedByUser = country.deletedBy ? userCache[country.deletedBy] : null;
      const createdByUser = userCache[country.createdBy] || null;
      const updatedByUser = country.updatedBy ? userCache[country.updatedBy] : null;
      
      return {
        name: country.name,
        isoCode: country.isoCode,
        categories: getCategoryNames(country.categories),
        categoriesCount: country.categories?.length || 0,
        createdBy: createdByUser?.name || 'Unknown',
        createdAt: formatTimestamp(country.createdAt) || '',
        updatedBy: updatedByUser?.name || 'Not updated',
        updatedAt: country.updatedAt ? formatTimestamp(country.updatedAt) || '' : '',
        deletedBy: deletedByUser?.name || 'Unknown',
        deletedAt: formatTimestamp(country.deletedAt) || '',
      };
    });
    
    if (format === 'csv') {
      // Export as CSV
      const headers = ['Name', 'ISO Code', 'Categories', 'Categories Count', 'Created By', 'Created At', 'Updated By', 'Updated At', 'Deleted By', 'Deleted At'];
      const csvContent = [
        headers.join(','),
        ...countriesData.map(row => 
          [row.name, row.isoCode, row.categories, row.categoriesCount, row.createdBy, row.createdAt, row.updatedBy, row.updatedAt, row.deletedBy, row.deletedAt]
            .map(val => `"${val}"`)
            .join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deleted-countries-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Export as JSON
      const blob = new Blob([JSON.stringify(countriesData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deleted-countries-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
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
            { label: 'Countries', href: '/countries' },
            { label: 'Trash' },
          ]}
        />

        {/* Page Header */}
        <TrashPageHeader totalCountries={filteredAndSortedCountries.length} onExport={handleExport} />

        {/* Search and Filter Bar */}
        <TrashSearchFilterBar
          searchQuery={searchQuery}
          hasActiveFilters={hasActiveFilters}
          totalCountries={deletedCountries.length}
          filteredCount={filteredAndSortedCountries.length}
          onSearchChange={setSearchQuery}
          onClearFilters={clearFilters}
        />

        {/* Stats Cards */}
        <TrashStatsCards countries={deletedCountries} />

        {/* Countries Table - Only show if there are results */}
        {filteredAndSortedCountries.length > 0 && (
          <TrashTable
            countries={filteredAndSortedCountries}
            userCache={userCache}
            sortField={sortField}
            sortOrder={sortOrder}
            getCategoryNames={getCategoryNames}
            formatTimestamp={formatTimestamp}
            onSort={handleSort}
            onView={handleView}
            onRestore={handleRestoreClick}
            onPermanentDelete={handlePermanentDeleteClick}
          />
        )}

        {/* Empty State */}
        {filteredAndSortedCountries.length === 0 && (
          <TrashEmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        )}
      </div>

      {/* Restore Confirmation Modal */}
      <ConfirmModal
        isOpen={restoreModal.isOpen}
        onClose={() => setRestoreModal({ isOpen: false, country: null })}
        onConfirm={handleRestoreConfirm}
        title="Restore Country"
        message={`Are you sure you want to restore "${restoreModal.country?.name}"? This country will be moved back to the active countries list.`}
        confirmText="Restore"
        type="warning"
      />

      {/* Permanent Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={permanentDeleteModal.isOpen}
        onClose={() => setPermanentDeleteModal({ isOpen: false, country: null })}
        onConfirm={handlePermanentDeleteConfirm}
        title="Permanently Delete Country"
        message={`Are you sure you want to permanently delete "${permanentDeleteModal.country?.name}"? This action cannot be undone.`}
        confirmText="Permanently Delete"
        type="danger"
      />
    </AdminLayout>
  );
}
