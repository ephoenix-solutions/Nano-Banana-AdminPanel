'use client';

import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useEditCategoryForm } from '@/lib/hooks/useEditCategoryForm';
import PageHeader from '@/components/categories/utils/PageHeader';
import FormInput from '@/components/categories/utils/FormInput';
import ErrorMessage from '@/components/categories/utils/ErrorMessage';
import FormActions from '@/components/categories/utils/FormActions';

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const {
    loading,
    saving,
    error,
    formData,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useEditCategoryForm(categoryId);

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
            { label: 'Categories', href: '/categories' },
            { label: 'Edit Category' }
          ]} 
        />

        {/* Page Header */}
        <PageHeader
          title="Edit Category"
          description="Update category information"
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
                label="Category Name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter category name"
              />

              {/* Order Field */}
              <FormInput
                id="order"
                name="order"
                label="Order"
                value={formData.order}
                onChange={handleChange}
                type="number"
                required
                min="0"
                placeholder="0"
              />
            </div>

            {/* Icon Image URL Field - Full Width */}
            <FormInput
              id="iconImage"
              name="iconImage"
              label="Icon Image URL"
              value={formData.iconImage}
              onChange={handleChange}
              type="url"
              optional
              placeholder="https://example.com/icon.png"
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
