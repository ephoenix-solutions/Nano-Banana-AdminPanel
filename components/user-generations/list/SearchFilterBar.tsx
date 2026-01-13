import { Icons } from '@/config/icons';
import { StatusFilter } from '@/lib/hooks/useUserGenerationsList';
import { User } from '@/lib/types/user.types';

interface SearchFilterBarProps {
  searchQuery: string;
  statusFilter: StatusFilter;
  userFilter: string;
  users: User[];
  hasActiveFilters: boolean;
  totalGenerations: number;
  filteredCount: number;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: StatusFilter) => void;
  onUserChange: (userId: string) => void;
  onClearFilters: () => void;
}

export default function SearchFilterBar({
  searchQuery,
  statusFilter,
  userFilter,
  users,
  hasActiveFilters,
  totalGenerations,
  filteredCount,
  onSearchChange,
  onStatusChange,
  onUserChange,
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
              placeholder="Search by prompt text, user name, or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary placeholder-secondary/50"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-40">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
            className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* User Filter */}
        <div className="w-full md:w-48">
          <select
            value={userFilter}
            onChange={(e) => onUserChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
          >
            <option value="all">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
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
          <span className="font-semibold text-primary">{totalGenerations}</span> generations
        </p>
      </div>
    </div>
  );
}
