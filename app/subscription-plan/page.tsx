'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { useSubscriptionPlansList } from '@/lib/hooks/useSubscriptionPlansList';
import { exportSubscriptionPlans, ExportFormat } from '@/lib/utils/exportSubscriptionPlans';

// Import list components
import PageHeader from '@/components/subscription-plan/list/PageHeader';
import StatsCards from '@/components/subscription-plan/list/StatsCards';
import PlansTable from '@/components/subscription-plan/list/PlansTable';
import ErrorMessage from '@/components/subscription-plan/list/ErrorMessage';

export default function SubscriptionPlansPage() {
  const {
    // Data
    plans,
    
    // Loading states
    loading,
    error,
    
    // CRUD operations
    handleAddPlan,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleToggleActive,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    fetchUserName,
    formatTimestamp,
  } = useSubscriptionPlansList();

  // Handle export
  const handleExport = async (format: ExportFormat) => {
    await exportSubscriptionPlans(format, {
      plans,
      fetchUserName,
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
        <Breadcrumbs items={[{ label: 'Subscription Plans' }]} />

        {/* Page Header */}
        <PageHeader onAddPlan={handleAddPlan} onExport={handleExport} totalPlans={plans.length} />

        {/* Stats Cards */}
        <StatsCards plans={plans} />

        {/* Error Message */}
        <ErrorMessage message={error} />

        {/* Plans Table */}
        <PlansTable
          plans={plans}
          fetchUserName={fetchUserName}
          formatTimestamp={formatTimestamp}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onToggleActive={handleToggleActive}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, plan: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Subscription Plan"
          message={`Are you sure you want to delete "${deleteModal.plan?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
