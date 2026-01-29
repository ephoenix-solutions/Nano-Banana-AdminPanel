import { Icons } from '@/config/icons';
import { RoleFilter, ProviderFilter } from '@/lib/hooks/useUsersTrash';

interface TrashSearchFilterBarProps {
  searchQuery: string;
  debouncedSearchQuery: string;
  roleFilter: RoleFilter;
  providerFilter: ProviderFilter;
  hasActiveFilters: boolean;
  totalUsers: number;
  filteredCount: number;
  onSearchChange: (query: string) => void;
  onRoleChange: (role: RoleFilter) => void;
  onProviderChange: (provider: ProviderFilter) => void;
  onClearFilters: () => void;
}

export default function TrashSearchFilterBar({
  searchQuery,
  debouncedSearchQuery,
  roleFilter,
  providerFilter,
  hasActiveFilters,
  totalUsers,
  filteredCount,
  onSearchChange,
  onRoleChange,
  onProviderChange,
  onClearFilters,
}: TrashSearchFilterBarProps) {
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
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary placeholder-secondary/50"
            />
            {searchQuery && searchQuery !== debouncedSearchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
              </div>
            )}
          </div>
        </div>

        {/* Role Filter */}
        <div className="w-full md:w-40">
          <select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value as RoleFilter)}
            className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Provider Filter */}
        <div className="w-full md:w-40">
          <select
            value={providerFilter}
            onChange={(e) => onProviderChange(e.target.value as ProviderFilter)}
            className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
          >
            <option value="all">All Providers</option>
            <option value="google">Google</option>
            <option value="apple">Apple</option>
            <option value="manual">Manual</option>
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
          <span className="font-semibold text-primary">{totalUsers}</span> deleted users
        </p>
      </div>
    </div>
  );
}
