'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useAddCategoryForm } from '@/lib/hooks/useAddCategoryForm';
import PageHeader from '@/components/categories/utils/PageHeader';
import FormInput from '@/components/categories/utils/FormInput';
import ErrorMessage from '@/components/categories/utils/ErrorMessage';
import FormActions from '@/components/categories/utils/FormActions';
import SubcategoriesSection from '@/components/categories/utils/SubcategoriesSection';

export default function AddCategoryPage() {
  const {
    loading,
    error,
    formData,
    handleChange,
    handleSubcategoryChange,
    addSubcategory,
    removeSubcategory,
    handleSubmit,
    handleCancel,
  } = useAddCategoryForm();

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Categories', href: '/categories' },
            { label: 'Add Category' }
          ]} 
        />

        {/* Page Header */}
        <PageHeader
          title="Add New Category"
          description="Create a new category"
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
              required
              placeholder="https://example.com/icon.png"
            />

            {/* Subcategories Section */}
            <SubcategoriesSection
              subcategories={formData.subcategories}
              onSubcategoryChange={handleSubcategoryChange}
              onAddSubcategory={addSubcategory}
              onRemoveSubcategory={removeSubcategory}
            />

            {/* Error Message */}
            <ErrorMessage message={error} />

            {/* Form Actions */}
            <FormActions
              loading={loading}
              onCancel={handleCancel}
              submitText="Create Category"
              loadingText="Creating..."
              submitIcon="check"
            />
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
