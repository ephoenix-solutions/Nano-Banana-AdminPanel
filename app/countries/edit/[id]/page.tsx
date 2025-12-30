'use client';

import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useEditCountryForm } from '@/lib/hooks/useEditCountryForm';
import PageHeader from '@/components/countries/utils/PageHeader';
import FormInput from '@/components/countries/utils/FormInput';
import CategoriesSelection from '@/components/countries/utils/CategoriesSelection';
import ErrorMessage from '@/components/countries/utils/ErrorMessage';
import FormActions from '@/components/countries/utils/FormActions';

export default function EditCountryPage() {
  const params = useParams();
  const countryId = params.id as string;

  const {
    loading,
    saving,
    error,
    categories,
    formData,
    handleChange,
    handleCategoryToggle,
    handleSubmit,
    handleCancel,
  } = useEditCountryForm(countryId);

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
            { label: 'Countries', href: '/countries' },
            { label: 'Edit Country' }
          ]} 
        />

        {/* Page Header */}
        <PageHeader
          title="Edit Country"
          description="Update country information and assigned categories"
          onBack={handleCancel}
        />

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-primary/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Country Name Field */}
              <FormInput
                id="name"
                name="name"
                label="Country Name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter country name"
              />

              {/* ISO Code Field */}
              <FormInput
                id="isoCode"
                name="isoCode"
                label="ISO Code"
                value={formData.isoCode}
                onChange={handleChange}
                required
                maxLength={2}
                placeholder="US"
                helperText="2-letter ISO country code (e.g., US, IN, GB)"
                className="uppercase"
              />
            </div>

            {/* Categories Selection */}
            <CategoriesSelection
              categories={categories}
              selectedCategories={formData.categories}
              onCategoryToggle={handleCategoryToggle}
            />

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
