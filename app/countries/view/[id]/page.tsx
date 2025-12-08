'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { getCountryById } from '@/lib/services/country.service';
import { getAllCategories } from '@/lib/services/category.service';
import { Country } from '@/lib/types/country.types';
import { Category } from '@/lib/types/category.types';

export default function ViewCountryPage() {
  const router = useRouter();
  const params = useParams();
  const countryId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchData();
  }, [countryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [countryData, categoriesData] = await Promise.all([
        getCountryById(countryId),
        getAllCategories(),
      ]);

      setCategories(categoriesData);

      if (countryData) {
        setCountry(countryData);
      } else {
        setError('Country not found');
      }
    } catch (err) {
      console.error('Error fetching country:', err);
      setError('Failed to load country');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/countries');
  };

  const handleEdit = () => {
    router.push(`/countries/edit/${countryId}`);
  };

  const getCategoryNames = (categoryIds: string[]) => {
    if (!categoryIds || categoryIds.length === 0) return [];
    
    return categoryIds
      .map((id) => {
        const category = categories.find((c) => c.id === id);
        return category?.name;
      })
      .filter(Boolean) as string[];
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

  if (error || !country) {
    return (
      <AdminLayout>
        <div className="w-full">
          <Breadcrumbs 
            items={[
              { label: 'Countries', href: '/countries' },
              { label: 'View Country' }
            ]} 
          />
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error || 'Country not found'}</p>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
          >
            <Icons.arrowLeft size={20} />
            <span>Back to Countries</span>
          </button>
        </div>
      </AdminLayout>
    );
  }

  const assignedCategories = getCategoryNames(country.categories || []);

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Countries', href: '/countries' },
            { label: 'View Country' }
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
              <span className="font-body text-sm">Back to Countries</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Country Details
            </h1>
            <p className="text-secondary mt-2 font-body">
              View country information and assigned categories
            </p>
          </div>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.edit size={20} />
            <span>Edit Country</span>
          </button>
        </div>

        {/* Country Details Card */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Country Header Section */}
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
            <div className="flex items-center gap-6">
              {/* Country Icon */}
              <div className="w-32 h-32 rounded-lg bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center">
                <Icons.globe size={64} className="text-accent" />
              </div>

              {/* Country Basic Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-primary font-heading mb-2">
                  {country.name}
                </h2>
                <div className="flex items-center gap-3 mt-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium bg-accent/20 text-primary font-mono">
                    {country.isoCode}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-primary">
                    <Icons.categories size={16} className="mr-2" />
                    {country.categories?.length || 0} categories assigned
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Section */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Country Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Country ID */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.globe size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Country ID</p>
                    <p className="text-base font-semibold text-primary font-body break-all">
                      {country.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Country Name */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.globe size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Country Name</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {country.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* ISO Code */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.file size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">ISO Code</p>
                    <p className="text-base font-semibold text-primary font-body font-mono">
                      {country.isoCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Categories Count */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.categories size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Assigned Categories</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {country.categories?.length || 0} categories
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Categories Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-primary font-heading mb-4">
                Assigned Categories ({assignedCategories.length})
              </h3>
              {assignedCategories.length > 0 ? (
                <div className="bg-background rounded-lg p-6 border border-primary/10">
                  <div className="flex flex-wrap gap-3">
                    {assignedCategories.map((categoryName, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-accent/20 border border-accent/30"
                      >
                        <Icons.categories size={16} className="text-accent mr-2" />
                        <span className="text-sm font-medium text-primary font-body">
                          {categoryName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-background rounded-lg p-8 border border-primary/10 text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.categories size={32} className="text-accent" />
                  </div>
                  <h4 className="text-lg font-bold text-primary font-heading mb-2">
                    No Categories Assigned
                  </h4>
                  <p className="text-secondary font-body mb-4">
                    This country doesn't have any categories assigned yet.
                  </p>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
                  >
                    <Icons.edit size={20} />
                    <span>Assign Categories</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={handleBack}
            className="px-6 py-3 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10"
          >
            Back to Countries
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.edit size={20} />
            <span>Edit Country</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
