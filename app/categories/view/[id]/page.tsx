'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { getCategoryById } from '@/lib/services/category.service';
import { Category } from '@/lib/types/category.types';

export default function ViewCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const categoryData = await getCategoryById(categoryId);
      if (categoryData) {
        setCategory(categoryData);
      } else {
        setError('Category not found');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/categories');
  };

  const handleEdit = () => {
    router.push(`/categories/edit/${categoryId}`);
  };

  const handleAddSubcategory = () => {
    router.push(`/categories/${categoryId}/subcategories/add`);
  };

  const handleEditSubcategory = (subcategoryId: string) => {
    router.push(`/categories/${categoryId}/subcategories/edit/${subcategoryId}`);
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
            <h1 className="text-4xl font-bold text-primary font-heading">
              Category Details
            </h1>
            <p className="text-secondary mt-2 font-body">
              View category information and subcategories
            </p>
          </div>
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
        </div>

        {/* Category Details Card */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Category Header Section */}
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
            <div className="flex items-center gap-6">
              {/* Category Icon */}
              <div className="relative">
                {category.iconImage ? (
                  <div className="relative group">
                    <img
                      src={category.iconImage}
                      alt={category.name}
                      className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-32 h-32 rounded-lg bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <Icons.categories size={48} className="text-accent" />
                    </div>
                    {/* Hover overlay to view full image */}
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Icons.images size={32} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center">
                    <Icons.categories size={48} className="text-accent" />
                  </div>
                )}
              </div>

              {/* Category Basic Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-primary font-heading mb-2">
                  {category.name}
                </h2>
                <div className="flex items-center gap-3 mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-primary">
                    <Icons.file size={16} className="mr-2" />
                    Order: {category.order}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-primary">
                    <Icons.search size={16} className="mr-2" />
                    {category.searchCount} searches
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-primary">
                    <Icons.categories size={16} className="mr-2" />
                    {category.subcategories?.length || 0} subcategories
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Section */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Category Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category ID */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.categories size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Category ID</p>
                    <p className="text-base font-semibold text-primary font-body break-all">
                      {category.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Name */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.file size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Category Name</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {category.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Display Order */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.file size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Display Order</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {category.order}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Count */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.search size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Total Searches</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {category.searchCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Icon Image URL Section */}
            {category.iconImage && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-primary font-heading mb-4">
                  Category Icon
                </h3>
                <div className="bg-background rounded-lg p-4 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icons.images size={20} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary font-body mb-2">Icon Image URL</p>
                      <p className="text-sm text-primary font-body break-all mb-3">
                        {category.iconImage}
                      </p>
                      <a
                        href={category.iconImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                      >
                        <Icons.globe size={16} />
                        Open in new tab
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subcategories Section */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-primary/10 overflow-hidden">
            <div className="p-6 border-b border-primary/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-primary font-heading">
                  Subcategories ({category.subcategories.length})
                </h3>
                <p className="text-sm text-secondary font-body mt-1">
                  All subcategories under this category
                </p>
              </div>
              <button
                onClick={handleAddSubcategory}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all text-sm"
              >
                <Icons.plus size={18} />
                <span>Add Subcategory</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-primary/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Search Count
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {category.subcategories.map((subcategory) => (
                    <tr
                      key={subcategory.id}
                      className="hover:bg-background/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icons.chevronRight size={16} className="text-secondary" />
                          <span className="font-medium text-primary font-body">
                            {subcategory.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary font-body">
                        {subcategory.order}
                      </td>
                      <td className="px-6 py-4 text-sm text-primary font-body">
                        {subcategory.searchCount}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEditSubcategory(subcategory.id)}
                          className="px-3 py-1.5 text-sm font-medium text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Subcategories Message */}
        {(!category.subcategories || category.subcategories.length === 0) && (
          <div className="mt-6 bg-white rounded-lg border border-primary/10 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.categories size={32} className="text-accent" />
              </div>
              <h3 className="text-lg font-bold text-primary font-heading mb-2">
                No Subcategories Yet
              </h3>
              <p className="text-secondary font-body mb-4">
                This category doesn't have any subcategories yet.
              </p>
              <button
                onClick={handleAddSubcategory}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
              >
                <Icons.plus size={20} />
                <span>Add First Subcategory</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={handleBack}
            className="px-6 py-3 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10"
          >
            Back to Categories
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.edit size={20} />
            <span>Edit Category</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
