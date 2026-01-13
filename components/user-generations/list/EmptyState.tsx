import { Icons } from '@/config/icons';

interface EmptyStateProps {
  type: 'no-data' | 'no-results';
  onClearFilters?: () => void;
}

export default function EmptyState({ type, onClearFilters }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
        <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icons.search size={40} className="text-secondary" />
        </div>
        <h3 className="text-xl font-bold text-primary font-heading mb-2">
          No Results Found
        </h3>
        <p className="text-secondary font-body mb-6 max-w-md mx-auto">
          No generations match your current filters. Try adjusting your search criteria.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.x size={20} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
      <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icons.images size={40} className="text-secondary" />
      </div>
      <h3 className="text-xl font-bold text-primary font-heading mb-2">
        No Generations Yet
      </h3>
      <p className="text-secondary font-body max-w-md mx-auto">
        User generations will appear here once users start generating images.
      </p>
    </div>
  );
}
