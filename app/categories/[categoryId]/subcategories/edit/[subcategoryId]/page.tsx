'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import {
  getCategoryById,
  getSubcategoryById,
  updateSubcategory,
} from '@/lib/services/category.service';
import { UpdateSubcategoryInput } from '@/lib/types/category.types';
import { useAuth } from '@/lib/hooks/useAuth';

export default function EditSubcategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const categoryId = params.categoryId as string;
  const subcategoryId = params.subcategoryId as string;

  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateSubcategoryInput>({
    name: '',
    order: 0,
    searchCount: 0,
  });

  useEffect(() => {
    fetchData();
  }, [categoryId, subcategoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch category name
      const category = await getCategoryById(categoryId);
      if (category) {
        setCategoryName(category.name);
      }

      // Fetch subcategory data
      const subcategory = await getSubcategoryById(categoryId, subcategoryId);
      if (subcategory) {
        setFormData({
          name: subcategory.name,
          order: subcategory.order,
          searchCount: subcategory.searchCount,
        });
      } else {
        setError('Subcategory not found');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load subcategory');
    } finally {
      setLoading(false);
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
    setSaving(true);
    setError(null);

    try {
      if (!formData.name?.trim()) {
        throw new Error('Subcategory name is required');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await updateSubcategory(categoryId, subcategoryId, {
        ...formData,
        updatedBy: user.id,
      });
      router.push('/categories');
    } catch (err: any) {
      console.error('Error updating subcategory:', err);
      setError(err.message || 'Failed to update subcategory');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/categories');
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
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Categories', href: '/categories' },
            { label: 'Edit Subcategory' }
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
            Edit Subcategory
          </h1>
          <p className="text-secondary mt-2 font-body">
            Update subcategory for <span className="font-semibold">{categoryName}</span>
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
                disabled={saving}
                className="px-6 py-3 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icons.save size={20} />
                    <span>Save Changes</span>
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
