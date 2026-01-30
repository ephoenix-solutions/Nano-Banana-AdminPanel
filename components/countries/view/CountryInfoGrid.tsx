import { Icons } from '@/config/icons';
import { Country } from '@/lib/types/country.types';

interface CountryInfoGridProps {
  country: Country;
  creatorName: string;
  creatorPhoto: string;
  updaterName: string;
  updaterPhoto: string;
  formatTimestamp: (timestamp: any) => string;
}

export default function CountryInfoGrid({
  country,
  creatorName,
  creatorPhoto,
  updaterName,
  updaterPhoto,
  formatTimestamp,
}: CountryInfoGridProps) {
  return (
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

      {/* Created By */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {creatorPhoto ? (
              <img
                src={creatorPhoto}
                alt={creatorName}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center"
              style={{ display: creatorPhoto ? 'none' : 'flex' }}
            >
              <Icons.users size={20} className="text-accent" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Created By</p>
            <p className="text-base font-semibold text-primary font-body">
              {creatorName}
            </p>
            {country.createdAt && (
              <p className="text-xs text-secondary font-body mt-1">
                {formatTimestamp(country.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Updated By */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {country.updatedBy && updaterPhoto ? (
              <img
                src={updaterPhoto}
                alt={updaterName}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center"
              style={{ display: (country.updatedBy && updaterPhoto) ? 'none' : 'flex' }}
            >
              <Icons.users size={20} className="text-secondary" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Updated By</p>
            {country.updatedBy ? (
              <>
                <p className="text-base font-semibold text-primary font-body">
                  {updaterName}
                </p>
                {country.updatedAt && (
                  <p className="text-xs text-secondary font-body mt-1">
                    {formatTimestamp(country.updatedAt)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-base text-secondary font-body italic">
                Not updated yet
              </p>
            )}
          </div>
        </div>
      </div>

       {/* isDeleted */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.trash size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Country Status</p>
            <p className="text-base font-semibold text-primary font-body">
              {country.isDeleted ? 'Deleted' : 'Active'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
