'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import {
  getCountryById,
  updateCountry,
} from '@/lib/services/country.service';
import { getAllCategories } from '@/lib/services/category.service';
import { UpdateCountryInput } from '@/lib/types/country.types';
import { Category } from '@/lib/types/category.types';
import { useAuth } from '@/lib/hooks/useAuth';

export default function EditCountryPage() {
  const router = useRouter();
  const params = useParams();
  const countryId = params.id as string;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<UpdateCountryInput>({
    name: '',
    isoCode: '',
    categories: [],
  });

  useEffect(() => {
    fetchData();
  }, [countryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [country, categoriesData] = await Promise.all([
        getCountryById(countryId),
        getAllCategories(),
      ]);
      
      setCategories(categoriesData);
      
      if (country) {
        setFormData({
          name: country.name,
          isoCode: country.isoCode,
          categories: country.categories || [],
        });
      } else {
        setError('Country not found');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'isoCode' ? value.toUpperCase() : value,
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => {
      const currentCategories = prev.categories || [];
      const isSelected = currentCategories.includes(categoryId);
      
      return {
        ...prev,
        categories: isSelected
          ? currentCategories.filter((id) => id !== categoryId)
          : [...currentCategories, categoryId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.name || !formData.name.trim()) {
        throw new Error('Country name is required');
      }
      if (!formData.isoCode || !formData.isoCode.trim()) {
        throw new Error('ISO code is required');
      }
      if (formData.isoCode.length !== 2) {
        throw new Error('ISO code must be exactly 2 characters');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await updateCountry(countryId, {
        ...formData,
        updatedBy: user.id,
      });
      router.push('/countries');
    } catch (err: any) {
      console.error('Error updating country:', err);
      setError(err.message || 'Failed to update country');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/countries');
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
            { label: 'Countries', href: '/countries' },
            { label: 'Edit Country' }
          ]} 
        />

        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
          >
            <Icons.arrowLeft size={20} />
            <span className="font-body text-sm">Back to Countries</span>
          </button>
          <h1 className="text-4xl font-bold text-primary font-heading">
            Edit Country
          </h1>
          <p className="text-secondary mt-2 font-body">
            Update country information and assigned categories
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-primary/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Country Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Country Name <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="Enter country name"
                />
              </div>

              {/* ISO Code Field */}
              <div>
                <label
                  htmlFor="isoCode"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  ISO Code <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  id="isoCode"
                  name="isoCode"
                  value={formData.isoCode}
                  onChange={handleChange}
                  required
                  maxLength={2}
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 uppercase"
                  placeholder="US"
                />
                <p className="text-xs text-secondary mt-1">
                  2-letter ISO country code (e.g., US, IN, GB)
                </p>
              </div>
            </div>

            {/* Categories Selection */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-3 font-body">
                Assign Categories <span className="text-secondary/50">(Optional)</span>
              </label>
              <div className="border border-primary/10 rounded-lg p-4 bg-background max-h-64 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-sm text-secondary text-center py-4">
                    No categories available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories?.includes(category.id) || false}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="w-5 h-5 rounded border-primary/10 text-accent focus:ring-accent focus:ring-2"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          {category.iconImage ? (
                            <img
                              src={category.iconImage}
                              alt={category.name}
                              className="w-6 h-6 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center">
                              <Icons.categories size={14} className="text-accent" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-primary">
                            {category.name}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-secondary mt-2">
                Selected: {formData.categories?.length || 0} categories
              </p>
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
