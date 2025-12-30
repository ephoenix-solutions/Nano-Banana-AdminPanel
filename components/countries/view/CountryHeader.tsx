import { Icons } from '@/config/icons';
import { Country } from '@/lib/types/country.types';

interface CountryHeaderProps {
  country: Country;
}

export default function CountryHeader({ country }: CountryHeaderProps) {
  return (
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
  );
}
