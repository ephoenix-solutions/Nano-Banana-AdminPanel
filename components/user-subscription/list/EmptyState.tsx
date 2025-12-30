import { Icons } from '@/config/icons';

interface EmptyStateProps {
  type: 'no-data' | 'no-results';
  onClearFilters?: () => void;
}

export default function EmptyState({ type, onClearFilters }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
        <Icons.search size={48} className="text-secondary/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-primary mb-2">No subscriptions found</h3>
        <p className="text-secondary mb-4">
          No subscriptions match your current filters. Try adjusting your search or filters.
        </p>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
      <Icons.userSubscription size={48} className="text-secondary/30 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-primary mb-2">No subscriptions yet</h3>
      <p className="text-secondary mb-4">
        There are no user subscriptions in the system yet.
      </p>
    </div>
  );
}
