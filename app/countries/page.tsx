'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { Country } from '@/lib/types/country.types';
import { Category } from '@/lib/types/category.types';
import {
  getAllCountries,
  deleteCountry,
} from '@/lib/services/country.service';
import { getAllCategories } from '@/lib/services/category.service';

export default function CountriesPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    country: Country | null;
  }>({
    isOpen: false,
    country: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [countriesData, categoriesData] = await Promise.all([
        getAllCountries(),
        getAllCategories(),
      ]);
      setCountries(countriesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryNames = (categoryIds: string[]) => {
    if (!categoryIds || categoryIds.length === 0) return 'No categories';
    
    const names = categoryIds
      .map((id) => {
        const category = categories.find((c) => c.id === id);
        return category?.name;
      })
      .filter(Boolean);
    
    return names.length > 0 ? names.join(', ') : 'No categories';
  };

  const handleAddCountry = () => {
    router.push('/countries/add');
  };

  const handleView = (country: Country) => {
    router.push(`/countries/view/${country.id}`);
  };

  const handleEdit = (country: Country) => {
    router.push(`/countries/edit/${country.id}`);
  };

  const handleDeleteClick = (country: Country) => {
    setDeleteModal({
      isOpen: true,
      country,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.country) return;

    try {
      await deleteCountry(deleteModal.country.id);
      await fetchData();
    } catch (err) {
      console.error('Error deleting country:', err);
      setError('Failed to delete country');
    }
  };

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.isoCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Countries' }]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Countries
            </h1>
            <p className="text-secondary mt-2 font-body">
              Manage country data and assigned categories
            </p>
          </div>
          <button
            onClick={handleAddCountry}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.plus size={20} />
            <span>Add Country</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Countries
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {countries.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.globe size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Filtered Results
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {filteredCountries.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.search size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Categories
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {categories.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.categories size={24} className="text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error}</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-primary/10 p-4">
          <div className="relative">
            <Icons.search
              size={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by country name or ISO code..."
              className="w-full pl-12 pr-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        {/* Countries Table */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Country Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    ISO Code
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Assigned Categories
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {filteredCountries.map((country) => (
                  <tr
                    key={country.id}
                    className="hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-primary">
                        {country.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary font-mono">
                        {country.isoCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/20 text-primary">
                          {country.categories?.length || 0} categories
                        </span>
                        {country.categories && country.categories.length > 0 && (
                          <span className="text-xs text-secondary truncate max-w-xs">
                            {getCategoryNames(country.categories)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(country)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-all"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(country)}
                          className="px-3 py-1.5 text-sm font-medium text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(country)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, country: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Country"
          message={`Are you sure you want to delete "${deleteModal.country?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
