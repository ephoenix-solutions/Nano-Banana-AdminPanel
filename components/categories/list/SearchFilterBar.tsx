import { Icons } from '@/config/icons';
import { SubcategoryFilter } from '@/lib/hooks/useCategoriesList';

interface SearchFilterBarProps {
  searchQuery: string;
  subcategoryFilter: SubcategoryFilter;
  hasActiveFilters: boolean;
  totalCategories: number;
  filteredCount: number;
  onSearchChange: (query: string) => void;
  onSubcategoryFilterChange: (filter: SubcategoryFilter) => void;
  onClearFilters: () => void;
}

export default function SearchFilterBar({
  searchQuery,
  subcategoryFilter,
  hasActiveFilters,
  totalCategories,
  filteredCount,
  onSearchChange,
  onSubcategoryFilterChange,
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
              placeholder="Search by category or subcategory name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary placeholder-secondary/50"
            />
          </div>
        </div>

        {/* Subcategory Filter */}
        <div className="w-full md:w-48">
          <select
            value={subcategoryFilter}
            onChange={(e) => onSubcategoryFilterChange(e.target.value as SubcategoryFilter)}
            className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
          >
            <option value="all">All Categories</option>
            <option value="with">With Subcategories</option>
            <option value="without">Without Subcategories</option>
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
          <span className="font-semibold text-primary">{totalCategories}</span> categories
        </p>
      </div>
    </div>
  );
}
