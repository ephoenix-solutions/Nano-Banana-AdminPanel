import { Icons } from '@/config/icons';

interface TrashEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function TrashEmptyState({ hasActiveFilters, onClearFilters }: TrashEmptyStateProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 p-12">
      <div className="text-center">
        <Icons.trash size={48} className="mx-auto text-secondary/30 mb-4" />
        <p className="text-secondary font-body text-lg">
          {hasActiveFilters ? 'No deleted users found matching your filters' : 'No deleted users in trash'}
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="mt-4 px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
