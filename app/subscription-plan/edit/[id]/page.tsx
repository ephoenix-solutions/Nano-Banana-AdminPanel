'use client';

import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useEditSubscriptionPlanForm } from '@/lib/hooks/useEditSubscriptionPlanForm';
import PageHeader from '@/components/subscription-plan/utils/PageHeader';
import FormInput from '@/components/subscription-plan/utils/FormInput';
import FormSelect from '@/components/subscription-plan/utils/FormSelect';
import FeaturesInput from '@/components/subscription-plan/utils/FeaturesInput';
import ErrorMessage from '@/components/subscription-plan/utils/ErrorMessage';
import FormActions from '@/components/subscription-plan/utils/FormActions';

export default function EditSubscriptionPlanPage() {
  const params = useParams();
  const planId = params.id as string;

  const {
    loading,
    saving,
    error,
    formData,
    newFeature,
    setNewFeature,
    handleChange,
    handleAddFeature,
    handleRemoveFeature,
    handleSubmit,
    handleCancel,
  } = useEditSubscriptionPlanForm(planId);

  const currencyOptions = [
    { value: 'INR', label: 'INR' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
  ];

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
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Subscription Plans', href: '/subscription-plan' },
            { label: 'Edit Plan' }
          ]} 
        />

        {/* Page Header */}
        <PageHeader
          title="Edit Subscription Plan"
          description="Update subscription plan information"
          onBack={handleCancel}
        />

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-primary/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <FormInput
                id="name"
                name="name"
                label="Plan Name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Basic, Pro, Premium"
              />

              {/* Order Field */}
              <FormInput
                id="order"
                name="order"
                label="Display Order"
                value={formData.order}
                onChange={handleChange}
                type="number"
                required
                min={0}
                placeholder="0"
              />

              {/* Price Field */}
              <FormInput
                id="price"
                name="price"
                label="Price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="199"
              />

              {/* Currency Field */}
              <FormSelect
                id="currency"
                name="currency"
                label="Currency"
                value={formData.currency}
                onChange={handleChange}
                options={currencyOptions}
                required
              />

              {/* Duration Days Field */}
              <FormInput
                id="durationDays"
                name="durationDays"
                label="Duration (Days)"
                value={formData.durationDays}
                onChange={handleChange}
                type="number"
                required
                min={1}
                placeholder="30"
              />

              {/* Generation Limit Field */}
              <FormInput
                id="generationLimit"
                name="generationLimit"
                label="Generation Limit"
                value={formData.generationLimit}
                onChange={handleChange}
                type="number"
                required
                min={0}
                placeholder="20"
              />
            </div>

            {/* Features Section */}
            <FeaturesInput
              features={formData.features}
              newFeature={newFeature}
              onNewFeatureChange={setNewFeature}
              onAddFeature={handleAddFeature}
              onRemoveFeature={handleRemoveFeature}
            />

            {/* Active Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded border-primary/10 text-accent focus:ring-accent focus:ring-2"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-primary font-body cursor-pointer"
              >
                Active (visible to users)
              </label>
            </div>

            {/* Error Message */}
            <ErrorMessage message={error} />

            {/* Form Actions */}
            <FormActions
              loading={saving}
              onCancel={handleCancel}
              submitText="Save Changes"
              loadingText="Saving..."
              submitIcon="save"
            />
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
