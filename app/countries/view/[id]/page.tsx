'use client';

import { useParams, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useCountryDetails } from '@/lib/hooks/useCountryDetails';
import CountryHeader from '@/components/countries/view/CountryHeader';
import CountryInfoGrid from '@/components/countries/view/CountryInfoGrid';
import AssignedCategories from '@/components/countries/view/AssignedCategories';

export default function ViewCountryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const countryId = params.id as string;
  const fromTrash = searchParams.get('from') === 'trash';

  const {
    loading,
    error,
    country,
    creatorName,
    creatorPhoto,
    updaterName,
    updaterPhoto,
    handleBack,
    handleEdit,
    getCategoryNames,
    formatTimestamp,
  } = useCountryDetails(countryId);

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
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-primary font-heading">
                Country Details
              </h1>
              {(fromTrash || country.isDeleted) && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-secondary/20 text-secondary border border-secondary/30">
                  <Icons.trash size={16} className="mr-1.5" />
                  Deleted
                </span>
              )}
            </div>
            <p className="text-secondary mt-2 font-body">
              View country information and assigned categories
            </p>
          </div>
          {!fromTrash && !country.isDeleted && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
            >
              <Icons.edit size={20} />
              <span>Edit Country</span>
            </button>
          )}
        </div>

        {/* Country Details Card */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Country Header Section */}
          <CountryHeader country={country} />

          {/* Detailed Information Section */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Country Information
            </h3>
            
            <CountryInfoGrid
              country={country}
              creatorName={creatorName}
              creatorPhoto={creatorPhoto}
              updaterName={updaterName}
              updaterPhoto={updaterPhoto}
              formatTimestamp={formatTimestamp}
            />

            {/* Assigned Categories Section */}
            <AssignedCategories
              categoryNames={assignedCategories}
              onEdit={handleEdit}
              hideActions={fromTrash || country.isDeleted}
            />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
