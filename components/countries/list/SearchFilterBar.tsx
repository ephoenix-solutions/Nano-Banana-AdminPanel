import { Icons } from '@/config/icons';
import { Category } from '@/lib/types/category.types';
import { CategoryFilter } from '@/lib/hooks/useCountriesList';

interface SearchFilterBarProps {
  searchQuery: string;
  categoryFilter: CategoryFilter;
  categories: Category[];
  hasActiveFilters: boolean;
  totalCountries: number;
  filteredCount: number;
  onSearchChange: (query: string) => void;
  onCategoryChange: (filter: CategoryFilter) => void;
  onClearFilters: () => void;
}

export default function SearchFilterBar({
  searchQuery,
  categoryFilter,
  categories,
  hasActiveFilters,
  totalCountries,
  filteredCount,
  onSearchChange,
  onCategoryChange,
  onClearFilters,
}: SearchFilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.search size={20} className="text-secondary" />
            </div>
            <input
              type="text"
              placeholder="Search by country name or ISO code..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary placeholder-secondary/50"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-64">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
          >
            <option value="all">All Countries</option>
            <option value="with">With Categories</option>
            <option value="without">Without Categories</option>
            <option disabled>───────────────</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-secondary/20 text-secondary rounded-lg font-semibold hover:bg-secondary/10 transition-all whitespace-nowrap"
          >
            <Icons.close size={20} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-primary/10">
        <p className="text-sm text-secondary font-body">
          Showing <span className="font-semibold text-primary">{filteredCount}</span> of{' '}
          <span className="font-semibold text-primary">{totalCountries}</span> countries
        </p>
      </div>
    </div>
  );
}
