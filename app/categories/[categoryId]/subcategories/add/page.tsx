'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import {
  getCategoryById,
  createSubcategory,
} from '@/lib/services/category.service';
import { CreateSubcategoryInput } from '@/lib/types/category.types';

export default function AddSubcategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as string;

  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateSubcategoryInput>({
    name: '',
    order: 0,
    searchCount: 0,
  });

  useEffect(() => {
    fetchCategoryName();
  }, [categoryId]);

  const fetchCategoryName = async () => {
    try {
      const category = await getCategoryById(categoryId);
      if (category) {
        setCategoryName(category.name);
      }
    } catch (err) {
      console.error('Error fetching category:', err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' || name === 'searchCount' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('Subcategory name is required');
      }

      await createSubcategory(categoryId, formData);
      router.push('/categories');
    } catch (err: any) {
      console.error('Error creating subcategory:', err);
      setError(err.message || 'Failed to create subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/categories');
  };

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Categories', href: '/categories' },
            { label: 'Add Subcategory' }
          ]} 
        />

        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
          >
            <Icons.arrowLeft size={20} />
            <span className="font-body text-sm">Back to Categories</span>
          </button>
          <h1 className="text-4xl font-bold text-primary font-heading">
            Add Subcategory
          </h1>
          <p className="text-secondary mt-2 font-body">
            Create a new subcategory for <span className="font-semibold">{categoryName}</span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-primary/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Subcategory Name <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="Enter subcategory name"
                />
              </div>

              {/* Order Field */}
              <div>
                <label
                  htmlFor="order"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Order <span className="text-secondary">*</span>
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Icons.alert size={20} className="text-secondary" />
                  <p className="text-secondary font-body text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary/10">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Icons.check size={20} />
                    <span>Create Subcategory</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
