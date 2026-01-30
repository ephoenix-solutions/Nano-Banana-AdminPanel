'use client';

import { useParams, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useCategoryDetails } from '@/lib/hooks/useCategoryDetails';
import CategoryHeader from '@/components/categories/view/CategoryHeader';
import CategoryInfoGrid from '@/components/categories/view/CategoryInfoGrid';
import CategoryIconSection from '@/components/categories/view/CategoryIconSection';
import SubcategoriesTable from '@/components/categories/view/SubcategoriesTable';

export default function ViewCategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params.id as string;
  const fromTrash = searchParams.get('from') === 'trash';

  const {
    loading,
    error,
    category,
    creatorName,
    creatorPhoto,
    updaterName,
    updaterPhoto,
    handleBack,
    handleEdit,
    handleAddSubcategory,
    handleEditSubcategory,
    formatTimestamp,
  } = useCategoryDetails(categoryId, fromTrash);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !category) {
    return (
      <AdminLayout>
        <div className="w-full">
          <Breadcrumbs 
            items={[
              { label: 'Categories', href: '/categories' },
              { label: 'View Category' }
            ]} 
          />
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error || 'Category not found'}</p>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
          >
            <Icons.arrowLeft size={20} />
            <span>Back to Categories</span>
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
            { label: 'Categories', href: '/categories' },
            { label: 'View Category' }
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
              <span className="font-body text-sm">Back to Categories</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-primary font-heading">
                Category Details
              </h1>
              {(fromTrash || category.isDeleted) && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-secondary/20 text-secondary border border-secondary/30">
                  <Icons.trash size={16} className="mr-1.5" />
                  Deleted
                </span>
              )}
            </div>
            <p className="text-secondary mt-2 font-body">
              View category information and subcategories
            </p>
          </div>
          {!fromTrash && !category.isDeleted && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddSubcategory}
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-all"
              >
                <Icons.plus size={20} />
                <span>Add Subcategory</span>
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
              >
                <Icons.edit size={20} />
                <span>Edit Category</span>
              </button>
            </div>
          )}
        </div>

        {/* Category Details Card */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Category Header Section */}
          <CategoryHeader category={category} />

          {/* Detailed Information Section */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Category Information
            </h3>
            
            <CategoryInfoGrid
              category={category}
              creatorName={creatorName}
              creatorPhoto={creatorPhoto}
              updaterName={updaterName}
              updaterPhoto={updaterPhoto}
              formatTimestamp={formatTimestamp}
            />

            <CategoryIconSection iconImage={category.iconImage} />
          </div>
        </div>

        {/* Subcategories Section */}
        <SubcategoriesTable
          category={category}
          onAddSubcategory={handleAddSubcategory}
          onEditSubcategory={handleEditSubcategory}
          formatTimestamp={formatTimestamp}
          hideActions={fromTrash || category.isDeleted}
        />

      </div>
    </AdminLayout>
  );
}
