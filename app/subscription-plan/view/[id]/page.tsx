'use client';

import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useSubscriptionPlanDetails } from '@/lib/hooks/useSubscriptionPlanDetails';
import PlanHeader from '@/components/subscription-plan/view/PlanHeader';
import PlanInfoGrid from '@/components/subscription-plan/view/PlanInfoGrid';
import PlanFeatures from '@/components/subscription-plan/view/PlanFeatures';

export default function ViewSubscriptionPlanPage() {
  const params = useParams();
  const planId = params.id as string;

  const {
    loading,
    error,
    plan,
    creatorName,
    creatorPhoto,
    updaterName,
    updaterPhoto,
    handleBack,
    handleEdit,
    formatTimestamp,
  } = useSubscriptionPlanDetails(planId);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !plan) {
    return (
      <AdminLayout>
        <div className="w-full">
          <Breadcrumbs 
            items={[
              { label: 'Subscription Plans', href: '/subscription-plan' },
              { label: 'View Plan' }
            ]} 
          />
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error || 'Subscription plan not found'}</p>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
          >
            <Icons.arrowLeft size={20} />
            <span>Back to Subscription Plans</span>
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Subscription Plans', href: '/subscription-plan' },
            { label: 'View Plan' }
          ]} 
        />

        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
            >
              <Icons.arrowLeft size={20} />
              <span className="font-body text-sm">Back to Subscription Plans</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Subscription Plan Details
            </h1>
            <p className="text-secondary mt-2 font-body">
              View subscription plan information and features
            </p>
          </div>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.edit size={20} />
            <span>Edit Plan</span>
          </button>
        </div>

        {/* Plan Details Card */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Plan Header Section */}
          <PlanHeader plan={plan} />

          {/* Detailed Information Section */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Plan Information
            </h3>
            
            <PlanInfoGrid
              plan={plan}
              creatorName={creatorName}
              creatorPhoto={creatorPhoto}
              updaterName={updaterName}
              updaterPhoto={updaterPhoto}
              formatTimestamp={formatTimestamp}
            />

            {/* Features Section */}
            <PlanFeatures features={plan.features} />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
